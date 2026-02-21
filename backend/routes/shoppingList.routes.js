import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';
import { getIngredientImage } from '../services/ingredientImages.service.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// Obtenir tous les items de la liste de courses de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const items = await prisma.shoppingListItem.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { isChecked: 'asc' },
        { category: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Ajouter une recette complète à la liste de courses
router.post('/from-recipe', async (req, res) => {
  try {
    const { recipeId, servings } = req.body;

    if (!recipeId || !servings) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipe ID et nombre de portions requis' 
      });
    }

    // Récupérer la recette
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

    // Parser les ingrédients
    const ingredients = JSON.parse(recipe.ingredients);
    const originalServings = recipe.servings || 1;
    const ratio = servings / originalServings;

    // Récupérer tous les items existants de l'utilisateur (non cochés)
    const existingItems = await prisma.shoppingListItem.findMany({
      where: {
        userId: req.user.id,
        isChecked: false
      }
    });

    const processedItems = [];
    const itemsToUpdate = [];
    const itemsToCreate = [];

    // Traiter chaque ingrédient
    for (const ingredient of ingredients) {
      let adjustedQuantity = ingredient.quantity;
      let numQuantity = 0;
      
      // Ajuster la quantité si c'est un nombre
      if (ingredient.quantity && !isNaN(parseFloat(ingredient.quantity))) {
        numQuantity = parseFloat(ingredient.quantity);
        adjustedQuantity = (numQuantity * ratio).toFixed(2).replace(/\.?0+$/, '');
      }

      const category = categorizeIngredient(ingredient.name);
      const unit = ingredient.unit || '';

      // Chercher un item existant avec le même nom, unité et catégorie
      const existingItem = existingItems.find(item => 
        item.name.toLowerCase() === ingredient.name.toLowerCase() &&
        item.unit === unit &&
        item.category === category
      );

      if (existingItem) {
        // Item existe : fusionner
        let newQuantity;
        
        if (numQuantity > 0) {
          // Quantité numérique : additionner
          const existingQuantity = parseFloat(existingItem.quantity) || 0;
          newQuantity = (existingQuantity + numQuantity * ratio).toFixed(2).replace(/\.?0+$/, '');
        } else {
          // Quantité non numérique : concaténer ou garder l'existante
          if (adjustedQuantity && existingItem.quantity && adjustedQuantity !== existingItem.quantity) {
            newQuantity = `${existingItem.quantity} + ${adjustedQuantity}`;
          } else {
            newQuantity = existingItem.quantity || adjustedQuantity;
          }
        }
        
        // Calculer le total des portions
        const existingServings = existingItem.servings || 0;
        const totalServings = existingServings + servings;
        
        // Mettre à jour les notes pour ajouter la recette source
        const existingNotes = existingItem.notes || '';
        const recipeInfo = `${recipe.title} (${servings})`;
        const newNotes = existingNotes 
          ? `${existingNotes}, ${recipeInfo}`
          : `Pour ${totalServings} portions: ${recipeInfo}`;
        
        // Si on ajoute à des notes existantes, recalculer le préfixe
        const finalNotes = existingNotes 
          ? `Pour ${totalServings} portions: ${newNotes.replace(/^Pour \d+ portions: /, '')}`
          : newNotes;

        itemsToUpdate.push({
          id: existingItem.id,
          quantity: newQuantity,
          servings: totalServings,
          notes: finalNotes
        });

        processedItems.push(existingItem.id);
      } else {
        // Nouvel item : créer
        const image = getIngredientImage(ingredient.name, category);
        itemsToCreate.push({
          userId: req.user.id,
          name: ingredient.name,
          quantity: adjustedQuantity,
          unit: unit,
          category: category,
          image: image,
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          servings: servings,
          notes: `Pour ${servings} portions: ${recipe.title} (${servings})`,
          isChecked: false
        });
      }
    }

    // Mettre à jour les items existants
    for (const item of itemsToUpdate) {
      await prisma.shoppingListItem.update({
        where: { id: item.id },
        data: {
          quantity: item.quantity,
          servings: item.servings,
          notes: item.notes
        }
      });
    }

    // Créer les nouveaux items
    if (itemsToCreate.length > 0) {
      await prisma.shoppingListItem.createMany({
        data: itemsToCreate
      });
    }

    const totalAdded = itemsToCreate.length;
    const totalMerged = itemsToUpdate.length;

    // Récupérer tous les items de la liste de courses
    const allItems = await prisma.shoppingListItem.findMany({
      where: {
        userId: req.user.id,
        isChecked: false
      },
      orderBy: { createdAt: 'desc' }
    });

    let message = '';
    if (totalMerged > 0 && totalAdded > 0) {
      message = `${totalAdded} nouveaux ingrédients ajoutés et ${totalMerged} ingrédients fusionnés`;
    } else if (totalMerged > 0) {
      message = `${totalMerged} ingrédients fusionnés avec votre liste`;
    } else {
      message = `${totalAdded} ingrédients ajoutés à votre liste`;
    }

    res.json({
      success: true,
      data: allItems,
      message: message
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la recette:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Ajouter un item manuel
router.post('/', async (req, res) => {
  try {
    const { name, quantity, unit, category, notes } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nom de l\'item est requis' 
      });
    }

    const finalCategory = category || categorizeIngredient(name);
    const image = getIngredientImage(name, finalCategory);

    const item = await prisma.shoppingListItem.create({
      data: {
        userId: req.user.id,
        name,
        quantity: quantity || '',
        unit: unit || '',
        category: finalCategory,
        image,
        notes,
        isChecked: false
      }
    });

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'item:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Cocher/décocher un item
router.patch('/:id/check', async (req, res) => {
  try {
    const { id } = req.params;
    const { isChecked } = req.body;

    const item = await prisma.shoppingListItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item non trouvé' 
      });
    }

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id },
      data: { isChecked }
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Modifier un item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, category, notes } = req.body;

    const item = await prisma.shoppingListItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item non trouvé' 
      });
    }

    const finalName = name || item.name;
    const finalCategory = category || item.category;
    const image = name && name !== item.name 
      ? getIngredientImage(finalName, finalCategory)
      : item.image;

    const updatedItem = await prisma.shoppingListItem.update({
      where: { id },
      data: {
        name: finalName,
        quantity: quantity !== undefined ? quantity : item.quantity,
        unit: unit !== undefined ? unit : item.unit,
        category: finalCategory,
        image,
        notes: notes !== undefined ? notes : item.notes
      }
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Erreur lors de la modification:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer tous les items cochés
router.delete('/clear-checked', async (req, res) => {
  try {
    const result = await prisma.shoppingListItem.deleteMany({
      where: {
        userId: req.user.id,
        isChecked: true
      }
    });

    res.json({ 
      success: true, 
      message: `${result.count} items supprimés`,
      count: result.count
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Supprimer un item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.shoppingListItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item non trouvé' 
      });
    }

    await prisma.shoppingListItem.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Item supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour catégoriser les ingrédients
function categorizeIngredient(name) {
  const lowerName = name.toLowerCase();
  
  // Fruits et légumes
  if (/(tomate|aubergine|courgette|poivron|oignon|ail|carotte|pomme de terre|salade|épinard|brocoli|chou|concombre|radis|navet|poireau|céleri|fenouil|asperge|artichaut|champignon|avocat|banane|pomme|poire|orange|citron|fraise|framboise|myrtille|raisin|melon|pastèque|ananas|mangue|kiwi|pêche|abricot|prune|cerise|fruit|légume)/.test(lowerName)) {
    return 'Fruits & Légumes';
  }
  
  // Viandes et poissons
  if (/(poulet|bœuf|porc|agneau|veau|canard|dinde|jambon|saucisse|viande|poisson|saumon|thon|cabillaud|sole|truite|crevette|moule|huître|calamar|crabe)/.test(lowerName)) {
    return 'Viandes & Poissons';
  }
  
  // Produits laitiers
  if (/(lait|crème|beurre|fromage|yaourt|mozzarella|parmesan|gruyère|chèvre|ricotta)/.test(lowerName)) {
    return 'Produits laitiers';
  }
  
  // Épicerie salée
  if (/(pâtes|riz|farine|huile|vinaigre|sel|poivre|sucre|miel|confiture|conserve|sauce|bouillon|épice|herbe|thym|basilic|persil|coriandre|cumin|paprika|curry|muscade)/.test(lowerName)) {
    return 'Épicerie';
  }
  
  // Pain et viennoiseries
  if (/(pain|baguette|croissant|brioche|toast)/.test(lowerName)) {
    return 'Boulangerie';
  }
  
  // Boissons
  if (/(eau|jus|vin|bière|soda|thé|café)/.test(lowerName)) {
    return 'Boissons';
  }
  
  // Surgelés
  if (/(surgelé|congelé|glace)/.test(lowerName)) {
    return 'Surgelés';
  }
  
  return 'Autre';
}

export default router;
