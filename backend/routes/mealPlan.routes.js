import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// Obtenir tous les repas planifiés de l'utilisateur (avec filtre par date optionnel)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = { userId: req.user.id };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where,
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            category: true,
            prepTime: true,
            cookTime: true,
            servings: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { mealType: 'asc' }
      ]
    });

    res.json({ success: true, data: mealPlans });
  } catch (error) {
    console.error('Erreur lors de la récupération des repas:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Obtenir un repas planifié spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        recipe: true
      }
    });

    if (!mealPlan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Repas planifié non trouvé' 
      });
    }

    res.json({ success: true, data: mealPlan });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Créer un ou plusieurs repas planifiés
router.post('/', async (req, res) => {
  try {
    const { recipeId, date, mealType, servings, notes, dates } = req.body;

    // Vérifier que la recette appartient à l'utilisateur
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        userId: req.user.id
      }
    });

    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recette non trouvée' 
      });
    }

    // Si dates est un tableau, créer plusieurs repas
    if (dates && Array.isArray(dates) && dates.length > 0) {
      const mealPlansData = dates.map(dateItem => ({
        userId: req.user.id,
        recipeId,
        date: new Date(dateItem.date),
        mealType: dateItem.mealType || mealType,
        servings: dateItem.servings || servings || recipe.servings,
        notes: dateItem.notes || notes || null,
        completed: false
      }));

      const mealPlans = await prisma.mealPlan.createMany({
        data: mealPlansData
      });

      // Récupérer les repas créés avec la recette
      const createdMealPlans = await prisma.mealPlan.findMany({
        where: {
          userId: req.user.id,
          recipeId,
          date: {
            in: dates.map(d => new Date(d.date))
          }
        },
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              description: true,
              image: true,
              category: true,
              prepTime: true,
              cookTime: true,
              servings: true
            }
          }
        }
      });

      res.json({ 
        success: true, 
        data: createdMealPlans,
        message: `${mealPlans.count} repas planifiés créés`
      });
    } else {
      // Créer un seul repas
      if (!date || !mealType) {
        return res.status(400).json({ 
          success: false, 
          message: 'Date et type de repas requis' 
        });
      }

      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId: req.user.id,
          recipeId,
          date: new Date(date),
          mealType,
          servings: servings || recipe.servings,
          notes: notes || null,
          completed: false
        },
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              description: true,
              image: true,
              category: true,
              prepTime: true,
              cookTime: true,
              servings: true
            }
          }
        }
      });

      res.json({ success: true, data: mealPlan });
    }
  } catch (error) {
    console.error('Erreur lors de la création du repas:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Mettre à jour un repas planifié
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, mealType, servings, notes, completed } = req.body;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!mealPlan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Repas planifié non trouvé' 
      });
    }

    const updatedMealPlan = await prisma.mealPlan.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        mealType: mealType || undefined,
        servings: servings !== undefined ? servings : undefined,
        notes: notes !== undefined ? notes : undefined,
        completed: completed !== undefined ? completed : undefined
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            category: true,
            prepTime: true,
            cookTime: true,
            servings: true
          }
        }
      }
    });

    res.json({ success: true, data: updatedMealPlan });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer un repas planifié
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!mealPlan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Repas planifié non trouvé' 
      });
    }

    await prisma.mealPlan.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Repas planifié supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Marquer un repas comme complété/non complété
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!mealPlan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Repas planifié non trouvé' 
      });
    }

    const updatedMealPlan = await prisma.mealPlan.update({
      where: { id },
      data: { completed: completed !== undefined ? completed : !mealPlan.completed },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            category: true,
            prepTime: true,
            cookTime: true,
            servings: true
          }
        }
      }
    });

    res.json({ success: true, data: updatedMealPlan });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
