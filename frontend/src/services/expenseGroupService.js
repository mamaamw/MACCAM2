import api from '../lib/axios';

const expenseGroupService = {
  // Obtenir tous les groupes
  getGroups: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.archived !== undefined) params.append('archived', options.archived);
      
      const queryString = params.toString();
      const url = `/expense-groups${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error);
      throw error;
    }
  },

  // Obtenir un groupe spécifique
  getGroup: async (id) => {
    try {
      const response = await api.get(`/expense-groups/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du groupe:', error);
      throw error;
    }
  },

  // Créer un nouveau groupe
  createGroup: async (groupData) => {
    try {
      const response = await api.post('/expense-groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      throw error;
    }
  },

  // Modifier un groupe
  updateGroup: async (id, groupData) => {
    try {
      const response = await api.put(`/expense-groups/${id}`, groupData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du groupe:', error);
      throw error;
    }
  },

  // Supprimer un groupe
  deleteGroup: async (id) => {
    try {
      const response = await api.delete(`/expense-groups/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      throw error;
    }
  },

  // Archiver un groupe
  archiveGroup: async (id) => {
    try {
      const response = await api.put(`/expense-groups/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'archivage du groupe:', error);
      throw error;
    }
  },

  // Désarchiver un groupe
  unarchiveGroup: async (id) => {
    try {
      const response = await api.put(`/expense-groups/${id}/unarchive`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la désarchivation du groupe:', error);
      throw error;
    }
  },

  // Ajouter un membre au groupe
  addMember: async (groupId, memberData) => {
    try {
      const response = await api.post(`/expense-groups/${groupId}/members`, memberData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      throw error;
    }
  },

  // Mettre à jour un membre du groupe
  updateMember: async (groupId, memberId, memberData) => {
    try {
      const response = await api.put(`/expense-groups/${groupId}/members/${memberId}`, memberData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du membre:', error);
      throw error;
    }
  },

  // Supprimer un membre du groupe
  removeMember: async (groupId, memberId) => {
    try {
      const response = await api.delete(`/expense-groups/${groupId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      throw error;
    }
  },

  // Obtenir les soldes du groupe
  getBalances: async (groupId) => {
    try {
      const response = await api.get(`/expense-groups/${groupId}/balances`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des soldes:', error);
      throw error;
    }
  }
};

export default expenseGroupService;
