import api from '../lib/axios';

const mealPlanService = {
  // Obtenir tous les repas planifiés (avec filtre par date optionnel)
  async getMealPlans(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/meal-plans', { params });
    return response.data;
  },

  // Obtenir un repas planifié spécifique
  async getMealPlan(id) {
    const response = await api.get(`/meal-plans/${id}`);
    return response.data;
  },

  // Créer un repas planifié
  async createMealPlan(data) {
    const response = await api.post('/meal-plans', data);
    return response.data;
  },

  // Créer plusieurs repas planifiés
  async createMultipleMealPlans(recipeId, dates, servings = null, notes = null) {
    const response = await api.post('/meal-plans', {
      recipeId,
      dates, // [{date, mealType, servings, notes}]
      servings,
      notes
    });
    return response.data;
  },

  // Mettre à jour un repas planifié
  async updateMealPlan(id, data) {
    const response = await api.put(`/meal-plans/${id}`, data);
    return response.data;
  },

  // Supprimer un repas planifié
  async deleteMealPlan(id) {
    const response = await api.delete(`/meal-plans/${id}`);
    return response.data;
  },

  // Marquer comme complété/non complété
  async toggleComplete(id, completed = null) {
    const response = await api.patch(`/meal-plans/${id}/complete`, {
      completed
    });
    return response.data;
  }
};

export default mealPlanService;
