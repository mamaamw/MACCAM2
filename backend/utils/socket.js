import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let ioInstance = null;
const activeConnectionsByUser = new Map();
const typingTimeouts = new Map();
const TYPING_TTL_MS = 8000;

const getSocketToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return authToken;

  const authorization = socket.handshake?.headers?.authorization;
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.split(' ')[1];
  }

  return null;
};

const joinUserRooms = async (socket, userId) => {
  socket.join(`user:${userId}`);

  const memberships = await prisma.conversationMember.findMany({
    where: {
      userId,
      leftAt: null
    },
    select: {
      conversationId: true
    }
  });

  memberships.forEach(({ conversationId }) => {
    socket.join(`conversation:${conversationId}`);
  });
};

const setConnectionCount = (userId, diff) => {
  const previous = activeConnectionsByUser.get(userId) || 0;
  const next = previous + diff;

  if (next <= 0) {
    activeConnectionsByUser.delete(userId);
    return 0;
  }

  activeConnectionsByUser.set(userId, next);
  return next;
};

const getDirectConversationIdsForUser = async (userId) => {
  const directConversations = await prisma.conversation.findMany({
    where: {
      type: 'DIRECT',
      members: {
        some: {
          userId,
          leftAt: null
        }
      }
    },
    select: {
      id: true
    }
  });

  return directConversations.map(conversation => conversation.id);
};

const typingKey = (conversationId, userId) => `${conversationId}:${userId}`;

const clearTypingTimeout = (conversationId, userId) => {
  const key = typingKey(conversationId, userId);
  const timeoutId = typingTimeouts.get(key);
  if (timeoutId) {
    clearTimeout(timeoutId);
    typingTimeouts.delete(key);
  }
};

const emitTypingUpdate = (conversationId, user, isTyping) => {
  if (!ioInstance) return;

  ioInstance.to(`conversation:${conversationId}`).emit('chat:typing:update', {
    conversationId,
    userId: user.id,
    isTyping,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
};

export const emitPresenceUpdate = async (userId, isOnline, lastSeenAt = null) => {
  if (!ioInstance || !userId) return;

  const directConversationIds = await getDirectConversationIdsForUser(userId);
  const payload = {
    userId,
    isOnline,
    lastSeenAt
  };

  directConversationIds.forEach(conversationId => {
    ioInstance.to(`conversation:${conversationId}`).emit('chat:presence:update', payload);
  });
};

export const emitToConversation = (conversationId, eventName, payload) => {
  if (!ioInstance || !conversationId || !eventName) return;
  ioInstance.to(`conversation:${conversationId}`).emit(eventName, payload);
};

export const getIO = () => ioInstance;

export const initializeSocket = (httpServer) => {
  if (ioInstance) return ioInstance;

  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }
  });

  ioInstance.use(async (socket, next) => {
    try {
      const token = getSocketToken(socket);
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, firstName: true, lastName: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return next(new Error('Unauthorized'));
      }

      socket.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      };
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  ioInstance.on('connection', async (socket) => {
    const userId = socket.user?.id;
    const typingConversations = new Set();
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { chatLastSeenAt: new Date() }
      });
    } catch {
    }

    setConnectionCount(userId, 1);

    try {
      await joinUserRooms(socket, userId);
    } catch {
    }

    emitPresenceUpdate(userId, true, new Date().toISOString()).catch(() => {});

    socket.on('chat:subscribe', (conversationIds = []) => {
      if (!Array.isArray(conversationIds)) return;
      conversationIds
        .filter(Boolean)
        .forEach(conversationId => socket.join(`conversation:${conversationId}`));
    });

    socket.on('chat:typing:set', async (payload = {}) => {
      const conversationId = payload?.conversationId;
      const isTyping = !!payload?.isTyping;

      if (!conversationId) return;

      try {
        const membership = await prisma.conversationMember.findFirst({
          where: {
            conversationId,
            userId,
            leftAt: null
          },
          select: { id: true }
        });

        if (!membership) return;

        if (!isTyping) {
          clearTypingTimeout(conversationId, userId);
          typingConversations.delete(conversationId);
          emitTypingUpdate(conversationId, socket.user, false);
          return;
        }

        typingConversations.add(conversationId);
        emitTypingUpdate(conversationId, socket.user, true);
        clearTypingTimeout(conversationId, userId);

        const key = typingKey(conversationId, userId);
        const timeoutId = setTimeout(() => {
          typingTimeouts.delete(key);
          emitTypingUpdate(conversationId, socket.user, false);
        }, TYPING_TTL_MS);

        typingTimeouts.set(key, timeoutId);
      } catch {
      }
    });

    socket.on('disconnect', async () => {
      typingConversations.forEach(conversationId => {
        clearTypingTimeout(conversationId, userId);
        emitTypingUpdate(conversationId, socket.user, false);
      });

      const remainingConnections = setConnectionCount(userId, -1);
      if (remainingConnections > 0) return;

      const lastSeenAt = new Date();

      try {
        await prisma.user.update({
          where: { id: userId },
          data: { chatLastSeenAt: lastSeenAt }
        });
      } catch {
      }

      emitPresenceUpdate(userId, false, lastSeenAt.toISOString()).catch(() => {});
    });
  });

  return ioInstance;
};
