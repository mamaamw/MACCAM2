import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect as authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

const chatUploadsDir = path.join(process.cwd(), 'uploads', 'chat');
if (!fs.existsSync(chatUploadsDir)) {
  fs.mkdirSync(chatUploadsDir, { recursive: true });
}

const chatUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, chatUploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const baseName = path.basename(file.originalname || 'attachment', ext)
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .slice(0, 50) || 'attachment';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`);
    }
  }),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

const getBlockState = async (currentUserId, otherUserId) => {
  if (!otherUserId) return false;

  const block = await prisma.userBlock.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: currentUserId,
        blockedId: otherUserId
      }
    }
  });

  return !!block;
};

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

/**
 * POST /api/chat/attachments
 * Upload d'une pièce jointe locale pour le chat
 * FormData: file, conversationId
 */
router.post('/attachments', chatUpload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId requis' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé à cette conversation' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/chat/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: fileUrl,
        path: `/uploads/chat/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de pièce jointe:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'upload de la pièce jointe' });
  }
});

// ============================================
// CONVERSATIONS
// ============================================

/**
 * GET /api/chat/conversations
 * Récupérer toutes les conversations de l'utilisateur connecté
 */
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            leftAt: null // Uniquement les conversations actives
          }
        }
      },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                isActive: true
              }
            }
          }
        },
        messages: {
          where: {
            hiddenFor: {
              none: { userId }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 1, // Dernier message seulement
          include: {
            conversation: false
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId },
                hiddenFor: {
                  none: { userId }
                }
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    const directOtherUserIds = conversations
      .filter(conv => conv.type === 'DIRECT')
      .map(conv => conv.members.find(m => m.userId !== userId)?.userId)
      .filter(Boolean);

    const blockedRows = directOtherUserIds.length > 0
      ? await prisma.userBlock.findMany({
          where: {
            blockerId: userId,
            blockedId: { in: directOtherUserIds }
          },
          select: {
            blockedId: true
          }
        })
      : [];

    const blockedSet = new Set(blockedRows.map(row => row.blockedId));

    // Enrichir les conversations avec des infos utiles
    const enrichedConversations = conversations.map(conv => {
      // Pour les conversations directes, trouver l'autre utilisateur
      let otherUser = null;
      let otherUserIsBlocked = false;
      if (conv.type === 'DIRECT') {
        otherUser = conv.members.find(m => m.userId !== userId)?.user || null;
        otherUserIsBlocked = !!otherUser?.id && blockedSet.has(otherUser.id);
      }

      const currentMembership = conv.members.find(m => m.userId === userId);

      // Compter les messages non lus reçus (pas ceux envoyés par l'utilisateur)
      const unreadCount = conv._count?.messages || 0;

      return {
        ...conv,
        otherUser, // Pour les conversations directes
        otherUserIsBlocked,
        notificationsMuted: !!currentMembership?.notificationsMuted,
        unreadCount,
        lastMessage: conv.messages[0] || null
      };
    });

    res.json(enrichedConversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /api/chat/conversations/:id
 * Récupérer une conversation spécifique avec tous ses messages
 */
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est membre de cette conversation
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId: id,
        userId: userId,
        leftAt: null
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé à cette conversation' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                isActive: true
              }
            }
          }
        },
        messages: {
          where: {
            hiddenFor: {
              none: { userId }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 100, // Limiter à 100 messages récents
          include: {
            conversation: false, // On a déjà la conversation
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Enrichir avec l'autre utilisateur pour les conversations directes
    let otherUser = null;
    let otherUserIsBlocked = false;
    if (conversation.type === 'DIRECT') {
      otherUser = conversation.members.find(m => m.userId !== userId)?.user || null;
      otherUserIsBlocked = await getBlockState(userId, otherUser?.id);
    }

    res.json({
      ...conversation,
      otherUser,
      otherUserIsBlocked,
      notificationsMuted: !!membership.notificationsMuted
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * POST /api/chat/conversations
 * Créer une nouvelle conversation (1-à-1 ou groupe)
 * Body: { type: 'DIRECT' | 'GROUP', participantIds: [userId1, userId2, ...], title?: string, description?: string }
 */
router.post('/conversations', async (req, res) => {
  try {
    const { type, participantIds, title, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!type || !['DIRECT', 'GROUP'].includes(type)) {
      return res.status(400).json({ message: 'Type de conversation invalide' });
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: 'Au moins un participant requis' });
    }

    const uniqueParticipantIds = [...new Set(participantIds.filter(Boolean))];

    // Vérifier que tous les participants existent
    const existingParticipants = await prisma.user.findMany({
      where: {
        id: { in: uniqueParticipantIds },
        isActive: true
      },
      select: { id: true }
    });

    if (existingParticipants.length !== uniqueParticipantIds.length) {
      return res.status(400).json({ message: 'Un ou plusieurs participants sont invalides ou inactifs' });
    }

    // Pour les conversations directes, vérifier qu'il n'y a qu'un seul participant (+ le créateur)
    if (type === 'DIRECT') {
      if (participantIds.length !== 1) {
        return res.status(400).json({ message: 'Une conversation directe ne peut avoir qu\'un seul participant' });
      }

      const targetUserId = uniqueParticipantIds[0];

      const blockingRelation = await prisma.userBlock.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: targetUserId },
            { blockerId: targetUserId, blockedId: userId }
          ]
        }
      });

      if (blockingRelation) {
        if (blockingRelation.blockerId === userId) {
          return res.status(403).json({ message: 'Vous avez bloqué cet utilisateur. Débloquez-le pour démarrer une discussion.' });
        }
        return res.status(403).json({ message: 'Cet utilisateur vous a bloqué.' });
      }

      // Vérifier si une conversation directe existe déjà entre ces 2 utilisateurs
      const existingConv = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            { members: { some: { userId: userId, leftAt: null } } },
            { members: { some: { userId: participantIds[0], leftAt: null } } }
          ]
        },
        include: {
          members: {
            where: { leftAt: null }
          }
        }
      });

      if (existingConv && existingConv.members.length === 2) {
        return res.json(existingConv); // Retourner la conversation existante
      }
    }

    // Pour les groupes, vérifier que le titre est fourni
    if (type === 'GROUP' && !title) {
      return res.status(400).json({ message: 'Un titre est requis pour les groupes' });
    }

    if (type === 'GROUP' && uniqueParticipantIds.length < 2) {
      return res.status(400).json({ message: 'Un groupe nécessite au moins 2 participants' });
    }

    // Créer la conversation avec ses membres
    const allParticipants = [userId, ...uniqueParticipantIds.filter(id => id !== userId)];

    const conversation = await prisma.conversation.create({
      data: {
        type,
        title: type === 'GROUP' ? title : null,
        description: type === 'GROUP' ? description : null,
        createdById: userId,
        lastMessageAt: new Date(),
        members: {
          create: allParticipants.map((participantId, index) => ({
            userId: participantId,
            isAdmin: participantId === userId // Le créateur est admin pour les groupes
          }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                isActive: true
              }
            }
          }
        },
        messages: true
      }
    });

    // Créer un message système pour les groupes
    if (type === 'GROUP') {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: `${req.user.firstName} ${req.user.lastName} a créé le groupe "${title}"`,
          type: 'SYSTEM'
        }
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/chat/conversations/:id
 * Supprimer (masquer) une conversation pour l'utilisateur courant
 */
router.delete('/conversations/:id', async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;

    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null
      },
      include: {
        conversation: {
          select: {
            id: true,
            type: true
          }
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé à cette conversation' });
    }

    await prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId,
        leftAt: null
      },
      data: {
        leftAt: new Date()
      }
    });

    if (membership.conversation.type === 'GROUP') {
      await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: `${req.user.firstName} ${req.user.lastName} a quitté le groupe`,
          type: 'SYSTEM'
        }
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      });
    }

    return res.json({ success: true, message: 'Conversation supprimée pour vous' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// MESSAGES
// ============================================

/**
 * POST /api/chat/conversations/:id/messages
 * Envoyer un message dans une conversation
 * Body: { content: string, type?: 'TEXT' | 'IMAGE' | 'FILE', attachmentUrl?: string }
 */
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content, type = 'TEXT', attachmentUrl } = req.body;
    const userId = req.user.id;

    // Validation
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Le contenu du message est requis' });
    }

    // Vérifier que l'utilisateur est membre de cette conversation
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Vous n\'êtes pas membre de cette conversation' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          where: { leftAt: null },
          select: { userId: true }
        }
      }
    });

    if (conversation?.type === 'DIRECT') {
      const otherUserId = conversation.members.find(member => member.userId !== userId)?.userId;

      if (otherUserId) {
        const blockingRelation = await prisma.userBlock.findFirst({
          where: {
            OR: [
              { blockerId: userId, blockedId: otherUserId },
              { blockerId: otherUserId, blockedId: userId }
            ]
          }
        });

        if (blockingRelation) {
          if (blockingRelation.blockerId === userId) {
            return res.status(403).json({ message: 'Vous avez bloqué cet utilisateur. Débloquez-le pour envoyer un message.' });
          }
          return res.status(403).json({ message: 'Cet utilisateur vous a bloqué.' });
        }
      }
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim(),
        type,
        attachmentUrl
      }
    });

    // Mettre à jour lastMessageAt de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    // Enrichir le message avec les infos de l'expéditeur
    const enrichedMessage = await prisma.message.findUnique({
      where: { id: message.id },
      include: {
        conversation: {
          select: {
            id: true,
            type: true,
            title: true
          }
        }
      }
    });

    // Ajouter les infos de l'utilisateur manuellement
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true
      }
    });

    res.status(201).json({
      ...enrichedMessage,
      sender
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /api/chat/conversations/:id/messages
 * Récupérer les messages d'une conversation (avec pagination)
 * Query params: ?limit=50&before=messageId
 */
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.user.id;

    // Vérifier que l'utilisateur est membre
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Construire la requête de messages
    const whereClause = {
      conversationId,
      hiddenFor: {
        none: { userId }
      }
    };

    // Si 'before' est fourni, récupérer les messages avant ce message (pagination)
    if (before) {
      const beforeMessage = await prisma.message.findUnique({
        where: { id: before },
        select: { createdAt: true }
      });

      if (beforeMessage) {
        whereClause.createdAt = {
          lt: beforeMessage.createdAt
        };
      }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      select: {
        id: true,
        content: true,
        type: true,
        attachmentUrl: true,
        senderId: true,
        isRead: true,
        isEdited: true,
        editedAt: true,
        deletedForEveryone: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Récupérer les infos des expéditeurs uniques
    const senderIds = [...new Set(messages.map(m => m.senderId))];
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true
      }
    });

    const senderMap = Object.fromEntries(senders.map(s => [s.id, s]));

    // Enrichir les messages avec les infos des expéditeurs
    const enrichedMessages = messages.map(msg => ({
      ...msg,
      sender: senderMap[msg.senderId]
    })).reverse(); // Inverser pour avoir l'ordre chronologique

    res.json(enrichedMessages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * PATCH /api/chat/messages/:id
 * Modifier un message et conserver l'historique des modifications
 */
router.patch('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu est requis' });
    }

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            members: {
              where: { userId, leftAt: null }
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.conversation.members.length === 0) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos messages' });
    }

    if (message.type === 'SYSTEM' || message.deletedForEveryone) {
      return res.status(400).json({ message: 'Ce message ne peut pas être modifié' });
    }

    const newContent = content.trim();
    if (newContent === message.content) {
      return res.json(message);
    }

    await prisma.messageEditHistory.create({
      data: {
        messageId: id,
        editorId: userId,
        previousContent: message.content,
        newContent
      }
    });

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        content: newContent,
        isEdited: true,
        editedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Erreur lors de la modification du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /api/chat/messages/:id/history
 * Historique des modifications d'un message
 */
router.get('/messages/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            members: {
              where: { userId, leftAt: null }
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.conversation.members.length === 0) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const history = await prisma.messageEditHistory.findMany({
      where: { messageId: id },
      orderBy: { editedAt: 'desc' },
      include: {
        editor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json(history);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/chat/messages/:id
 * Supprimer un message pour moi ou pour tout le monde
 * Body: { scope: 'me' | 'everyone' }
 */
router.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { scope = 'me' } = req.body || {};
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            members: {
              where: { userId, leftAt: null }
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.conversation.members.length === 0) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (scope === 'everyone') {
      if (message.senderId !== userId) {
        return res.status(403).json({ message: 'Vous ne pouvez supprimer pour tout le monde que vos messages' });
      }

      const updatedMessage = await prisma.message.update({
        where: { id },
        data: {
          content: 'Ce message a été supprimé',
          attachmentUrl: null,
          deletedForEveryone: true,
          deletedAt: new Date(),
          deletedById: userId,
          isEdited: false,
          isRead: true
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      });

      return res.json({ success: true, scope: 'everyone', message: updatedMessage });
    }

    await prisma.messageHidden.upsert({
      where: {
        messageId_userId: {
          messageId: id,
          userId
        }
      },
      create: {
        messageId: id,
        userId
      },
      update: {}
    });

    return res.json({ success: true, scope: 'me' });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// GESTION DES GROUPES
// ============================================

/**
 * POST /api/chat/conversations/:id/members
 * Ajouter un membre à un groupe
 * Body: { userId: string }
 */
router.post('/conversations/:id/members', async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { userId: newMemberId } = req.body;
    const userId = req.user.id;

    if (!newMemberId) {
      return res.status(400).json({ message: 'userId requis' });
    }

    // Vérifier que la conversation est un groupe
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    if (conversation.type !== 'GROUP') {
      return res.status(400).json({ message: 'Impossible d\'ajouter des membres à une conversation directe' });
    }

    // Vérifier que l'utilisateur est admin du groupe
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null,
        isAdmin: true
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Seuls les admins peuvent ajouter des membres' });
    }

    // Vérifier que le nouveau membre n'est pas déjà dans le groupe
    const existingMembership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId: newMemberId,
        leftAt: null
      }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Cet utilisateur est déjà membre du groupe' });
    }

    // Ajouter le membre
    const newMember = await prisma.conversationMember.create({
      data: {
        conversationId,
        userId: newMemberId,
        isAdmin: false
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            isActive: true
          }
        }
      }
    });

    // Créer un message système
    const newUser = await prisma.user.findUnique({
      where: { id: newMemberId },
      select: { firstName: true, lastName: true }
    });

    await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: `${req.user.firstName} ${req.user.lastName} a ajouté ${newUser.firstName} ${newUser.lastName} au groupe`,
        type: 'SYSTEM'
      }
    });

    res.status(201).json(newMember);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/chat/conversations/:id/members/:userId
 * Retirer un membre d'un groupe (ou quitter le groupe)
 */
router.delete('/conversations/:id/members/:memberId', async (req, res) => {
  try {
    const { id: conversationId, memberId } = req.params;
    const userId = req.user.id;

    // Vérifier que la conversation est un groupe
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    if (conversation.type !== 'GROUP') {
      return res.status(400).json({ message: 'Impossible de retirer des membres d\'une conversation directe' });
    }

    // Si l'utilisateur retire quelqu'un d'autre, vérifier qu'il est admin
    if (memberId !== userId) {
      const membership = await prisma.conversationMember.findFirst({
        where: {
          conversationId,
          userId,
          leftAt: null,
          isAdmin: true
        }
      });

      if (!membership) {
        return res.status(403).json({ message: 'Seuls les admins peuvent retirer des membres' });
      }
    }

    // Marquer le membre comme ayant quitté
    await prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId: memberId,
        leftAt: null
      },
      data: {
        leftAt: new Date()
      }
    });

    // Créer un message système
    const removedUser = await prisma.user.findUnique({
      where: { id: memberId },
      select: { firstName: true, lastName: true }
    });

    const message = memberId === userId
      ? `${removedUser.firstName} ${removedUser.lastName} a quitté le groupe`
      : `${req.user.firstName} ${req.user.lastName} a retiré ${removedUser.firstName} ${removedUser.lastName} du groupe`;

    await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: message,
        type: 'SYSTEM'
      }
    });

    res.json({ message: 'Membre retiré avec succès' });
  } catch (error) {
    console.error('Erreur lors du retrait du membre:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /api/chat/users
 * Récupérer la liste des utilisateurs actifs pour créer une conversation
 */
router.get('/users', async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId }, // Exclure l'utilisateur connecté
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        jobTitle: true,
        company: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * GET /api/chat/users/blocked
 * Récupérer la liste des utilisateurs bloqués par l'utilisateur courant
 */
router.get('/users/blocked', async (req, res) => {
  try {
    const blockerId = req.user.id;

    const blockedUsers = await prisma.userBlock.findMany({
      where: { blockerId },
      include: {
        blocked: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(
      blockedUsers
        .filter(entry => !!entry.blocked)
        .map(entry => ({
          id: entry.blocked.id,
          firstName: entry.blocked.firstName,
          lastName: entry.blocked.lastName,
          email: entry.blocked.email,
          avatar: entry.blocked.avatar,
          isActive: entry.blocked.isActive,
          blockedAt: entry.createdAt
        }))
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs bloqués:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * PATCH /api/chat/conversations/:id/read
 * Marquer tous les messages d'une conversation comme lus ou non-lus
 */
router.patch('/conversations/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isRead } = req.body;

    // Vérifier que l'utilisateur est membre de cette conversation
    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId: id,
        userId: userId,
        leftAt: null
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Déterminer le nouveau statut (par défaut, basculer tous les messages à "lu")
    const newStatus = typeof isRead === 'boolean' ? isRead : true;

    // Mettre à jour uniquement les messages reçus par l'utilisateur connecté
    // (lu = lu par le destinataire)
    const result = await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId }
      },
      data: {
        isRead: newStatus
      }
    });

    res.json({ 
      success: true, 
      updatedCount: result.count,
      isRead: newStatus
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de lecture:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * PATCH /api/chat/conversations/:id/notifications
 * Activer/désactiver les notifications pour une conversation (utilisateur courant)
 */
router.patch('/conversations/:id/notifications', async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;
    const { muted } = req.body;

    if (typeof muted !== 'boolean') {
      return res.status(400).json({ message: 'Le champ muted (boolean) est requis' });
    }

    const membership = await prisma.conversationMember.findFirst({
      where: {
        conversationId,
        userId,
        leftAt: null
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    await prisma.conversationMember.update({
      where: { id: membership.id },
      data: { notificationsMuted: muted }
    });

    return res.json({ success: true, muted });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * POST /api/chat/users/:id/block
 * Bloquer un utilisateur
 */
router.post('/users/:id/block', async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;

    if (!blockedId || blockedId === blockerId) {
      return res.status(400).json({ message: 'Utilisateur à bloquer invalide' });
    }

    const user = await prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'Utilisateur introuvable ou inactif' });
    }

    await prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId
        }
      },
      create: {
        blockerId,
        blockedId
      },
      update: {}
    });

    return res.json({ success: true, blocked: true });
  } catch (error) {
    console.error('Erreur lors du blocage utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/chat/users/:id/block
 * Débloquer un utilisateur
 */
router.delete('/users/:id/block', async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;

    if (!blockedId || blockedId === blockerId) {
      return res.status(400).json({ message: 'Utilisateur à débloquer invalide' });
    }

    await prisma.userBlock.deleteMany({
      where: {
        blockerId,
        blockedId
      }
    });

    return res.json({ success: true, blocked: false });
  } catch (error) {
    console.error('Erreur lors du déblocage utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
