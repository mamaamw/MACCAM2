import api from '../lib/axios';

const chatService = {
  // ============================================
  // CONVERSATIONS
  // ============================================
  
  /**
   * Récupérer toutes les conversations de l'utilisateur
   */
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  /**
   * Récupérer une conversation spécifique avec tous ses messages
   */
  getConversation: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Créer une nouvelle conversation
   * @param {Object} data - { type: 'DIRECT' | 'GROUP', participantIds: [...], title?: string, description?: string }
   */
  createConversation: async (data) => {
    const response = await api.post('/chat/conversations', data);
    return response.data;
  },

  /**
   * Créer une conversation directe avec un utilisateur
   */
  createDirectConversation: async (userId) => {
    return chatService.createConversation({
      type: 'DIRECT',
      participantIds: [userId]
    });
  },

  /**
   * Créer un groupe
   */
  createGroup: async (title, participantIds, description = '') => {
    return chatService.createConversation({
      type: 'GROUP',
      title,
      participantIds,
      description
    });
  },

  // ============================================
  // MESSAGES
  // ============================================

  /**
   * Récupérer les messages d'une conversation
   * @param {string} conversationId 
   * @param {Object} options - { limit?: number, before?: string }
   */
  getMessages: async (conversationId, options = {}) => {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.before) params.append('before', options.before);

    const response = await api.get(
      `/chat/conversations/${conversationId}/messages?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Envoyer un message
   * @param {string} conversationId 
   * @param {Object} message - { content: string, type?: string, attachmentUrl?: string }
   */
  sendMessage: async (conversationId, message) => {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      message
    );
    return response.data;
  },

  /**
   * Envoyer un message texte simple
   */
  sendTextMessage: async (conversationId, content) => {
    return chatService.sendMessage(conversationId, {
      content,
      type: 'TEXT'
    });
  },

  // ============================================
  // GESTION DES GROUPES
  // ============================================

  /**
   * Ajouter un membre à un groupe
   */
  addMember: async (conversationId, userId) => {
    const response = await api.post(
      `/chat/conversations/${conversationId}/members`,
      { userId }
    );
    return response.data;
  },

  /**
   * Retirer un membre d'un groupe
   */
  removeMember: async (conversationId, userId) => {
    const response = await api.delete(
      `/chat/conversations/${conversationId}/members/${userId}`
    );
    return response.data;
  },

  /**
   * Quitter un groupe
   */
  leaveGroup: async (conversationId, userId) => {
    return chatService.removeMember(conversationId, userId);
  },

  // ============================================
  // UTILISATEURS
  // ============================================

  /**
   * Récupérer la liste des utilisateurs actifs pour créer une conversation
   */
  getUsers: async () => {
    const response = await api.get('/chat/users');
    return response.data;
  }
};

export default chatService;
