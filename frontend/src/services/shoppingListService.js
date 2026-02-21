import api from '../lib/axios';

const shoppingListService = {
  // Obtenir tous les items
  getItems: async () => {
    try {
      const response = await api.get('/shopping-list');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste:', error);
      throw error;
    }
  },

  // Ajouter une recette complète
  addFromRecipe: async (recipeId, servings) => {
    try {
      const response = await api.post('/shopping-list/from-recipe', {
        recipeId,
        servings
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la recette:', error);
      throw error;
    }
  },

  // Ajouter un item manuel
  addItem: async (itemData) => {
    try {
      const response = await api.post('/shopping-list', itemData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'item:', error);
      throw error;
    }
  },

  // Cocher/décocher un item
  toggleCheck: async (id, isChecked) => {
    try {
      const response = await api.patch(`/shopping-list/${id}/check`, { isChecked });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  },

  // Modifier un item
  updateItem: async (id, itemData) => {
    try {
      const response = await api.put(`/shopping-list/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  },

  // Supprimer un item
  deleteItem: async (id) => {
    try {
      const response = await api.delete(`/shopping-list/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  },

  // Supprimer tous les items cochés
  clearChecked: async () => {
    try {
      const response = await api.delete('/shopping-list/clear-checked');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }
};

export default shoppingListService;
