import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';
import recipeImporter from '../services/recipeImporter.service.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// GET /api/recipes - Récupérer toutes les recettes de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, isFavorite, search } = req.query;
    
    const where = { userId: req.user.id };
    
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (isFavorite === 'true') where.isFavorite = true;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } }
      ];
    }
    
    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/recipes/:id - Récupérer une recette spécifique
router.get('/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });
    
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recette non trouvée' });
    }
    
    // Vérifier que l'utilisateur a accès à cette recette
    if (recipe.userId !== req.user.id && !recipe.isPublic) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/recipes - Créer une nouvelle recette
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      prepTime,
      cookTime,
      servings,
      ingredients,
      steps,
      image,
      tags,
      cuisine,
      isPublic,
      isFavorite,
      notes,
      source,
      sourceUrl
    } = req.body;
    
    const recipe = await prisma.recipe.create({
      data: {
        userId: req.user.id,
        title,
        description,
        category,
        difficulty: difficulty || 'Inconnue',
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        servings: servings ? parseInt(servings) : 4,
        ingredients: JSON.stringify(ingredients || []),
        steps: JSON.stringify(steps || []),
        image,
        tags: tags ? JSON.stringify(tags) : null,
        cuisine,
        isPublic: isPublic || false,
        isFavorite: isFavorite || false,
        notes,
        source,
        sourceUrl
      }
    });
    
    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/recipes/import - Importer une recette depuis une URL
router.post('/import', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL requise' 
      });
    }
    
    // Valider l'URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ 
        success: false, 
        message: 'URL invalide' 
      });
    }
    
    // Importer la recette
    const recipeData = await recipeImporter.parseRecipeFromUrl(url);
    
    // Ajouter l'ID de l'utilisateur
    recipeData.userId = req.user.id;
    
    res.json({ success: true, data: recipeData });
  } catch (error) {
    console.error('Erreur import recette:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Impossible d\'importer cette recette' 
    });
  }
});

// PUT /api/recipes/:id - Modifier une recette
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      prepTime,
      cookTime,
      servings,
      ingredients,
      steps,
      image,
      tags,
      cuisine,
      isPublic,
      isFavorite,
      notes,
      source,
      sourceUrl
    } = req.body;
    
    // Vérifier que la recette appartient à l'utilisateur
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingRecipe || existingRecipe.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    
    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        category,
        difficulty,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        servings: servings ? parseInt(servings) : null,
        ingredients: ingredients ? JSON.stringify(ingredients) : undefined,
        steps: steps ? JSON.stringify(steps) : undefined,
        image,
        tags: tags ? JSON.stringify(tags) : null,
        cuisine,
        isPublic,
        isFavorite,
        notes,
        source,
        sourceUrl
      }
    });
    
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/recipes/:id - Supprimer une recette
router.delete('/:id', async (req, res) => {
  try {
    // Vérifier que la recette appartient à l'utilisateur
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id }
    });
    
    if (!recipe || recipe.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    
    await prisma.recipe.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true, message: 'Recette supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/recipes/:id/favorite - Basculer le statut favori
router.patch('/:id/favorite', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: req.params.id }
    });
    
    if (!recipe || recipe.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    
    const updatedRecipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data: { isFavorite: !recipe.isFavorite }
    });
    
    res.json({ success: true, data: updatedRecipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/recipes/stats/summary - Statistiques des recettes
router.get('/stats/summary', async (req, res) => {
  try {
    const [total, favorites, byCategory] = await Promise.all([
      prisma.recipe.count({ where: { userId: req.user.id } }),
      prisma.recipe.count({ where: { userId: req.user.id, isFavorite: true } }),
      prisma.recipe.groupBy({
        by: ['category'],
        where: { userId: req.user.id },
        _count: true
      })
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        favorites,
        byCategory: byCategory.reduce((acc, item) => {
          acc[item.category] = item._count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
