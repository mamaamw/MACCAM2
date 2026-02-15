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

  /**
   * Supprimer (masquer) une conversation pour l'utilisateur courant
   */
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}`);
    return response.data;
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
   * Uploader une pièce jointe pour une conversation
   */
  uploadAttachment: async (conversationId, file) => {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('file', file);

    const response = await api.post('/chat/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

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

  /**
   * Modifier un message
   */
  editMessage: async (messageId, content) => {
    const response = await api.patch(`/chat/messages/${messageId}`, { content });
    return response.data;
  },

  /**
   * Supprimer un message
   * scope: 'me' | 'everyone'
   */
  deleteMessage: async (messageId, scope = 'me') => {
    const response = await api.delete(`/chat/messages/${messageId}`, { data: { scope } });
    return response.data;
  },

  /**
   * Récupérer l'historique des modifications d'un message
   */
  getMessageHistory: async (messageId) => {
    const response = await api.get(`/chat/messages/${messageId}/history`);
    return response.data;
  },

  /**
   * Marquer tous les messages d'une conversation comme lus ou non-lus
   * @param {string} conversationId - ID de la conversation
   * @param {boolean} isRead - true pour marquer comme lu, false pour non-lu
   */
  markConversationAsRead: async (conversationId, isRead = true) => {
    const response = await api.patch(
      `/chat/conversations/${conversationId}/read`,
      { isRead }
    );
    return response.data;
  },

  /**
   * Activer/désactiver les notifications d'une conversation
   */
  setConversationNotifications: async (conversationId, muted) => {
    const response = await api.patch(
      `/chat/conversations/${conversationId}/notifications`,
      { muted }
    );
    return response.data;
  },

  /**
   * Bloquer un utilisateur
   */
  blockUser: async (userId) => {
    const response = await api.post(`/chat/users/${userId}/block`);
    return response.data;
  },

  /**
   * Débloquer un utilisateur
   */
  unblockUser: async (userId) => {
    const response = await api.delete(`/chat/users/${userId}/block`);
    return response.data;
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
  },

  /**
   * Récupérer la liste des utilisateurs bloqués
   */
  getBlockedUsers: async () => {
    const response = await api.get('/chat/users/blocked');
    return response.data;
  },

  // ============================================
  // PREFERENCES CHAT
  // ============================================

  /**
   * Récupérer les emojis récents synchronisés côté backend
   */
  getRecentEmojis: async () => {
    const response = await api.get('/chat/preferences/recent-emojis');
    return response.data;
  },

  /**
   * Sauvegarder les emojis récents côté backend
   */
  updateRecentEmojis: async (emojis) => {
    const response = await api.put('/chat/preferences/recent-emojis', { emojis });
    return response.data;
  },

  /**
   * Heartbeat de présence chat (en ligne / dernière activité)
   */
  heartbeatPresence: async () => {
    const response = await api.patch('/chat/presence/heartbeat');
    return response.data;
  }
};

export default chatService;
