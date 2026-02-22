import api from '../lib/axios';

const expenseService = {
  // Créer une nouvelle dépense
  createExpense: async (expenseData, photos = []) => {
    try {
      const formData = new FormData();
      
      // Ajouter les données de base
      formData.append('groupId', expenseData.groupId);
      formData.append('paidById', expenseData.paidById);
      formData.append('description', expenseData.description);
      formData.append('amount', expenseData.amount);
      formData.append('date', expenseData.date);
      formData.append('category', expenseData.category || '');
      formData.append('participants', JSON.stringify(expenseData.participants));
      
      // Ajouter les photos
      if (photos && photos.length > 0) {
        photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const response = await api.post('/expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la dépense:', error);
      throw error;
    }
  },

  // Modifier une dépense
  updateExpense: async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dépense:', error);
      throw error;
    }
  },

  // Supprimer une dépense
  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la dépense:', error);
      throw error;
    }
  },

  // Ajouter des photos à une dépense
  addPhotos: async (expenseId, photos) => {
    try {
      const formData = new FormData();
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const response = await api.post(`/expenses/${expenseId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout des photos:', error);
      throw error;
    }
  },

  // Supprimer une photo d'une dépense
  deletePhoto: async (expenseId, photoIndex) => {
    try {
      const response = await api.delete(`/expenses/${expenseId}/photos/${photoIndex}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      throw error;
    }
  }
};

export default expenseService;
