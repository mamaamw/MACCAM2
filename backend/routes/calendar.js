import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/calendar/events
 * Récupérer tous les événements de l'utilisateur connecté
 */
router.get('/events', protect, async (req, res) => {
  try {
    const { start, end, view } = req.query;
    
    // Construire les filtres
    const where = {
      userId: req.user.id
    };
    
    // Filtrer par période si spécifié
    if (start && end) {
      where.startDate = {
        gte: new Date(start),
        lte: new Date(end)
      };
    }
    
    const events = await prisma.event.findMany({
      where,
      orderBy: {
        startDate: 'asc'
      }
    });
    
    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/calendar/events/:id
 * Récupérer un événement spécifique
 */
router.get('/events/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    
    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Erreur récupération événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'événement',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/calendar/events
 * Créer un nouvel événement
 */
router.post('/events', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      location,
      type,
      color,
      reminder,
      isRecurring,
      recurrenceRule,
      attendees
    } = req.body;
    
    console.log('Création événement - données reçues:', req.body);
    console.log('User ID:', req.user.id);
    
    // Validation
    if (!title || !startDate || !endDate) {
      console.log('Validation échouée - champs manquants');
      return res.status(400).json({
        success: false,
        message: 'Titre, date de début et date de fin sont requis'
      });
    }
    
    // Validation des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      console.log('Validation échouée - dates invalides');
      return res.status(400).json({
        success: false,
        message: 'La date de début doit être antérieure à la date de fin'
      });
    }
    
    const eventData = {
      title,
      description,
      startDate: start,
      endDate: end,
      allDay: allDay || false,
      location,
      type: type || 'EVENT',
      color: color || 'primary',
      reminder,
      isRecurring: isRecurring || false,
      recurrenceRule,
      attendees,
      userId: req.user.id
    };
    
    console.log('Données pour Prisma:', eventData);
    
    const event = await prisma.event.create({
      data: eventData
    });
    
    console.log('Événement créé avec succès:', event.id);
    
    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      event
    });
  } catch (error) {
    console.error('Erreur création événement:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/calendar/events/:id
 * Mettre à jour un événement
 */
router.put('/events/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      location,
      type,
      color,
      reminder,
      isRecurring,
      recurrenceRule,
      attendees
    } = req.body;
    
    // Vérifier que l'événement existe et appartient à l'utilisateur
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    
    // Validation des dates si modifiées
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'La date de début doit être antérieure à la date de fin'
        });
      }
    }
    
    // Préparer les données à mettre à jour
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (allDay !== undefined) updateData.allDay = allDay;
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type;
    if (color !== undefined) updateData.color = color;
    if (reminder !== undefined) updateData.reminder = reminder;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurrenceRule !== undefined) updateData.recurrenceRule = recurrenceRule;
    if (attendees !== undefined) updateData.attendees = attendees;
    
    const event = await prisma.event.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      event
    });
  } catch (error) {
    console.error('Erreur mise à jour événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'événement',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/calendar/events/:id
 * Supprimer un événement
 */
router.delete('/events/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'événement existe et appartient à l'utilisateur
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }
    
    await prisma.event.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/calendar/stats
 * Obtenir les statistiques du calendrier
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Événements du mois
    const monthEvents = await prisma.event.count({
      where: {
        userId: req.user.id,
        startDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });
    
    // Événements à venir
    const upcomingEvents = await prisma.event.count({
      where: {
        userId: req.user.id,
        startDate: {
          gte: now
        }
      }
    });
    
    // Événements par type
    const eventsByType = await prisma.event.groupBy({
      by: ['type'],
      where: {
        userId: req.user.id
      },
      _count: {
        type: true
      }
    });
    
    res.json({
      success: true,
      stats: {
        monthEvents,
        upcomingEvents,
        eventsByType
      }
    });
  } catch (error) {
    console.error('Erreur stats calendrier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

export default router;
