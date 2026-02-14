import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect as authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

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
          orderBy: { createdAt: 'desc' },
          take: 1, // Dernier message seulement
          include: {
            conversation: false
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    // Enrichir les conversations avec des infos utiles
    const enrichedConversations = conversations.map(conv => {
      // Pour les conversations directes, trouver l'autre utilisateur
      let otherUser = null;
      if (conv.type === 'DIRECT') {
        otherUser = conv.members.find(m => m.userId !== userId)?.user || null;
      }

      // Compter les messages non lus (on pourrait ajouter un champ readBy later)
      const unreadCount = 0; // TODO: implémenter le système de lecture

      return {
        ...conv,
        otherUser, // Pour les conversations directes
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
          orderBy: { createdAt: 'asc' },
          take: 100, // Limiter à 100 messages récents
          include: {
            conversation: false // On a déjà la conversation
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Enrichir avec l'autre utilisateur pour les conversations directes
    let otherUser = null;
    if (conversation.type === 'DIRECT') {
      otherUser = conversation.members.find(m => m.userId !== userId)?.user || null;
    }

    res.json({
      ...conversation,
      otherUser
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

    // Pour les conversations directes, vérifier qu'il n'y a qu'un seul participant (+ le créateur)
    if (type === 'DIRECT') {
      if (participantIds.length !== 1) {
        return res.status(400).json({ message: 'Une conversation directe ne peut avoir qu\'un seul participant' });
      }

      // Vérifier si une conversation directe existe déjà entre ces 2 utilisateurs
      const existingConv = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            { members: { some: { userId: userId } } },
            { members: { some: { userId: participantIds[0] } } }
          ]
        },
        include: {
          members: true
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

    // Créer la conversation avec ses membres
    const allParticipants = [userId, ...participantIds.filter(id => id !== userId)];

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
      conversationId
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

export default router;
