import { useState, useEffect, useRef } from 'react';
import chatService from '../../services/chatService';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function Chat() {
  const { user, token } = useAuthStore();
  
  // Log de débogage
  console.log('🎯 Chat Component Mounted', {
    user: user ? `${user.firstName} ${user.lastName}` : 'null',
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
  });

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedUsersCount, setBlockedUsersCount] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationFilter, setConversationFilter] = useState('Newest');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyMessage, setHistoryMessage] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [loadingBlockedUsers, setLoadingBlockedUsers] = useState(false);
  const [unblockingUserId, setUnblockingUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Charger les conversations au démarrage
  useEffect(() => {
    console.log('📥 Loading conversations...');
    loadConversations();
    loadBlockedUsers(true);
  }, []);

  // Charger les messages uniquement quand l'ID de conversation change
  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      console.log('📡 Fetching conversations from API...');
      setLoading(true);
      const data = await chatService.getConversations();
      console.log('✅ Conversations loaded:', data);
      setConversations(data);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error('Erreur lors du chargement des conversations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await chatService.getConversation(conversationId);
      const loadedMessages = data.messages || [];
      console.log('📨 Messages chargés:', {
        count: loadedMessages.length,
        currentUserId: user?.id,
        sampleMessage: loadedMessages[0] ? {
          id: loadedMessages[0].id,
          senderId: loadedMessages[0].senderId,
          senderObjectId: loadedMessages[0].sender?.id,
          content: loadedMessages[0].content?.substring(0, 20)
        } : null
      });

      const hasUnreadIncoming = loadedMessages.some(
        msg => !msg.isRead && String(msg.senderId || msg.sender?.id) !== String(user?.id)
      );

      const conversationInList = conversations.find(conv => conv.id === conversationId);
      const hasUnreadBadge = (conversationInList?.unreadCount || 0) > 0;

      if (hasUnreadIncoming || hasUnreadBadge) {
        await chatService.markConversationAsRead(conversationId, true);

        setConversations(prev => prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ));

        setSelectedConversation(prev => (
          prev?.id === conversationId ? { ...prev, unreadCount: 0 } : prev
        ));

        setMessages(loadedMessages.map(msg =>
          String(msg.senderId || msg.sender?.id) === String(user?.id)
            ? msg
            : { ...msg, isRead: true }
        ));
      } else {
        setMessages(loadedMessages);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des messages');
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const message = await chatService.sendTextMessage(selectedConversation.id, newMessage.trim());
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'envoi du message');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleStartEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleCancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleSaveEditMessage = async (messageId) => {
    if (!editingContent.trim()) {
      toast.error('Le message ne peut pas être vide');
      return;
    }

    try {
      const updatedMessage = await chatService.editMessage(messageId, editingContent.trim());
      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, ...updatedMessage } : msg));
      setEditingMessageId(null);
      setEditingContent('');
      toast.success('Message modifié');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la modification');
      console.error(error);
    }
  };

  const handleDeleteMessage = async (messageId, scope) => {
    try {
      const result = await chatService.deleteMessage(messageId, scope);

      if (scope === 'me') {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        toast.success('Message supprimé pour vous');
        return;
      }

      if (result?.message) {
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, ...result.message } : msg));
      }

      toast.success('Message supprimé pour tout le monde');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression');
      console.error(error);
    }
  };

  const handleOpenMessageHistory = async (message) => {
    try {
      setShowHistoryModal(true);
      setHistoryMessage(message);
      setLoadingHistory(true);
      const history = await chatService.getMessageHistory(message.id);
      setMessageHistory(history);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors du chargement de l\'historique');
      console.error(error);
      setShowHistoryModal(false);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleMarkConversationAsRead = async (conversationIdOrIsRead, isRead = undefined) => {
    // Si le premier paramètre est un boolean, c'est l'ancien format (depuis l'en-tête)
    let conversationId;
    let readStatus;
    
    if (typeof conversationIdOrIsRead === 'boolean') {
      // Appelé depuis l'en-tête avec juste isRead
      if (!selectedConversation) return;
      conversationId = selectedConversation.id;
      readStatus = conversationIdOrIsRead;
    } else {
      // Appelé depuis la sidebar avec conversationId et isRead
      conversationId = conversationIdOrIsRead;
      readStatus = isRead;
    }
    
    try {
      await chatService.markConversationAsRead(conversationId, readStatus);

      // Mettre à jour la conversation dans la sidebar (badge non-lu)
      setConversations(prev => prev.map(conv => {
        if (conv.id !== conversationId) return conv;

        const computedUnread = readStatus
          ? 0
          : Math.max(
              1,
              conv.unreadCount || messages.filter(
                msg => String(msg.senderId || msg.sender?.id) !== String(user?.id)
              ).length
            );

        return {
          ...conv,
          unreadCount: computedUnread
        };
      }));

      setSelectedConversation(prev => {
        if (!prev || prev.id !== conversationId) return prev;

        const computedUnread = readStatus
          ? 0
          : Math.max(
              1,
              prev.unreadCount || messages.filter(
                msg => String(msg.senderId || msg.sender?.id) !== String(user?.id)
              ).length
            );

        return {
          ...prev,
          unreadCount: computedUnread
        };
      });
      
      // Si c'est la conversation actuellement sélectionnée, mettre à jour les messages
      if (selectedConversation?.id === conversationId) {
        setMessages(messages.map(msg =>
          String(msg.senderId || msg.sender?.id) === String(user?.id)
            ? msg
            : { ...msg, isRead: readStatus }
        ));
      }
      
      toast.success(readStatus ? 'Discussion marquée comme lue' : 'Discussion marquée comme non-lue');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error(error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await chatService.getUsers();
      setUsers(data.filter(u => u.id !== user?.id));
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFeatureNotAvailable = (featureLabel) => {
    toast.info(`${featureLabel} sera disponible bientôt`);
  };

  const handleOpenAddMemberModal = async () => {
    if (!selectedConversation) return;

    if (selectedConversation.type !== 'GROUP') {
      toast.error('Ajout disponible uniquement pour les groupes');
      return;
    }

    if (users.length === 0) {
      await loadUsers();
    }

    setShowAddMemberModal(true);
  };

  const handleAddMemberToGroup = async (newUserId) => {
    if (!selectedConversation || selectedConversation.type !== 'GROUP') {
      toast.error('Aucun groupe sélectionné');
      return;
    }

    try {
      setAddingMember(true);
      await chatService.addMember(selectedConversation.id, newUserId);
      await Promise.all([
        loadConversations(),
        loadMessages(selectedConversation.id)
      ]);
      setShowAddMemberModal(false);
      toast.success('Membre ajouté au groupe');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'ajout du membre');
      console.error(error);
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeleteConversation = async (conversationArg = null) => {
    const conversationToDelete = conversationArg || selectedConversation;

    if (!conversationToDelete?.id) {
      toast.error('Aucune conversation sélectionnée');
      return;
    }

    const confirmed = window.confirm('Supprimer cette conversation pour vous ?');
    if (!confirmed) return;

    try {
      await chatService.deleteConversation(conversationToDelete.id);

      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete.id));

      if (selectedConversation?.id === conversationToDelete.id) {
        setSelectedConversation(null);
        setMessages([]);
      }

      toast.success('Conversation supprimée');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression de la conversation');
      console.error(error);
    }
  };

  const handleToggleConversationNotifications = async (conversationArg = null) => {
    const conversationToUpdate = conversationArg || selectedConversation;

    if (!conversationToUpdate?.id) {
      toast.error('Aucune conversation sélectionnée');
      return;
    }

    const nextMuted = !conversationToUpdate.notificationsMuted;

    try {
      await chatService.setConversationNotifications(conversationToUpdate.id, nextMuted);

      setConversations(prev => prev.map(conv =>
        conv.id === conversationToUpdate.id
          ? { ...conv, notificationsMuted: nextMuted }
          : conv
      ));

      if (selectedConversation?.id === conversationToUpdate.id) {
        setSelectedConversation(prev => prev ? { ...prev, notificationsMuted: nextMuted } : prev);
      }

      toast.success(nextMuted ? 'Notifications désactivées' : 'Notifications activées');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour des notifications');
      console.error(error);
    }
  };

  const handleToggleBlockUser = async () => {
    if (!selectedConversation) {
      toast.error('Aucune conversation sélectionnée');
      return;
    }

    if (selectedConversation.type !== 'DIRECT') {
      toast.error('Le blocage est disponible uniquement pour les discussions directes');
      return;
    }

    const otherUserId = selectedConversation.otherUser?.id
      || selectedConversation.members?.find(m => m?.user?.id && m.user.id !== user?.id)?.user?.id;

    if (!otherUserId) {
      toast.error('Utilisateur introuvable');
      return;
    }

    const currentlyBlocked = !!selectedConversation.otherUserIsBlocked;

    try {
      if (currentlyBlocked) {
        await chatService.unblockUser(otherUserId);
      } else {
        await chatService.blockUser(otherUserId);
      }

      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, otherUserIsBlocked: !currentlyBlocked }
          : conv
      ));

      setSelectedConversation(prev => prev ? { ...prev, otherUserIsBlocked: !currentlyBlocked } : prev);

      if (currentlyBlocked) {
        setBlockedUsers(prev => prev.filter(blockedUser => blockedUser.id !== otherUserId));
        setBlockedUsersCount(prev => Math.max(0, prev - 1));
      } else {
        setBlockedUsersCount(prev => prev + 1);
      }

      toast.success(currentlyBlocked ? 'Utilisateur débloqué' : 'Utilisateur bloqué');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour du blocage');
      console.error(error);
    }
  };

  const loadBlockedUsers = async (silent = false) => {
    try {
      setLoadingBlockedUsers(true);
      const data = await chatService.getBlockedUsers();
      const blockedList = data || [];
      setBlockedUsers(blockedList);
      setBlockedUsersCount(blockedList.length);
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || 'Erreur lors du chargement des utilisateurs bloqués');
      }
      console.error(error);
    } finally {
      setLoadingBlockedUsers(false);
    }
  };

  const handleOpenBlockedUsersModal = async () => {
    await loadBlockedUsers();
    setShowBlockedUsersModal(true);
  };

  const handleUnblockFromList = async (blockedUserId) => {
    try {
      setUnblockingUserId(blockedUserId);
      await chatService.unblockUser(blockedUserId);

      setBlockedUsers(prev => prev.filter(blockedUser => blockedUser.id !== blockedUserId));
      setBlockedUsersCount(prev => Math.max(0, prev - 1));

      setConversations(prev => prev.map(conv => {
        if (conv.type !== 'DIRECT') return conv;

        const otherMemberId = conv.otherUser?.id
          || conv.members?.find(m => m?.user?.id && m.user.id !== user?.id)?.user?.id;

        if (String(otherMemberId) !== String(blockedUserId)) return conv;
        return { ...conv, otherUserIsBlocked: false };
      }));

      setSelectedConversation(prev => {
        if (!prev || prev.type !== 'DIRECT') return prev;

        const otherMemberId = prev.otherUser?.id
          || prev.members?.find(m => m?.user?.id && m.user.id !== user?.id)?.user?.id;

        if (String(otherMemberId) !== String(blockedUserId)) return prev;
        return { ...prev, otherUserIsBlocked: false };
      });

      toast.success('Utilisateur débloqué');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors du déblocage');
      console.error(error);
    } finally {
      setUnblockingUserId(null);
    }
  };

  const handleCreateDirectChat = async (userId) => {
    try {
      // Vérifier si une conversation directe avec cet utilisateur existe déjà
      const existingConversation = conversations.find(conv => {
        if (conv.type !== 'DIRECT') return false;
        
        // Trouver l'autre membre de la conversation (pas nous)
        const otherMember = conv.members?.find(m => m?.user?.id && m.user.id !== user?.id);
        
        // Vérifier si c'est le bon utilisateur
        return otherMember?.user?.id === userId;
      });

      if (existingConversation) {
        // Conversation déjà existante, on la sélectionne
        setSelectedConversation(existingConversation);
        setShowNewChatModal(false);
        toast.info('Cette conversation existe déjà');
        return;
      }

      // Sinon, créer une nouvelle conversation
      const conversation = await chatService.createDirectConversation(userId);
      setConversations([conversation, ...conversations]);
      setSelectedConversation(conversation);
      setShowNewChatModal(false);
      toast.success('Conversation créée');
    } catch (error) {
      toast.error('Erreur lors de la création de la conversation');
      console.error(error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!groupTitle.trim() || selectedUsers.length < 2) {
      toast.error('Veuillez entrer un titre et sélectionner au moins 2 participants');
      return;
    }

    try {
      // Vérifier si un groupe avec exactement les mêmes participants existe déjà
      const selectedUserIds = selectedUsers.map(u => u.id).sort();
      const existingGroup = conversations.find(conv => {
        if (conv.type !== 'GROUP') return false;
        
        // Obtenir les IDs de tous les membres du groupe (sauf nous)
        const memberIds = conv.members
          ?.filter(m => m?.user?.id && m.user.id !== user?.id)
          .map(m => m.user.id)
          .sort();
        
        // Vérifier si les listes de participants sont identiques
        if (memberIds?.length !== selectedUserIds.length) return false;
        return memberIds?.every((id, index) => id === selectedUserIds[index]);
      });

      if (existingGroup) {
        // Groupe déjà existant avec les mêmes participants, on le sélectionne
        setSelectedConversation(existingGroup);
        setShowNewGroupModal(false);
        setGroupTitle('');
        setGroupDescription('');
        setSelectedUsers([]);
        toast.info('Ce groupe existe déjà');
        return;
      }

      // Sinon, créer un nouveau groupe
      const conversation = await chatService.createGroup(
        groupTitle,
        selectedUsers.map(u => u.id),
        groupDescription
      );
      setConversations([conversation, ...conversations]);
      setSelectedConversation(conversation);
      setShowNewGroupModal(false);
      setGroupTitle('');
      setGroupDescription('');
      setSelectedUsers([]);
      toast.success('Groupe créé');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la création du groupe');
      console.error(error);
    }
  };

  const formatMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'NOW';
    if (diffInMinutes < 60) return `${diffInMinutes} MIN AGO`;
    if (diffInHours < 24) return `${diffInHours} HOUR AGO`;
    if (diffInDays < 7) return `${diffInDays} DAY AGO`;
    return messageDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase();
  };

  const getConversationTitle = (conversation) => {
    if (conversation.type === 'GROUP') {
      return conversation.title;
    }
    // Pour les conversations directes, afficher le nom de l'autre participant
    const otherMember = conversation.members?.find(m => m?.user?.id && m.user.id !== user?.id);
    return otherMember?.user ? `${otherMember.user.firstName} ${otherMember.user.lastName}` : 'Conversation';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'GROUP' && conversation.avatar) {
      return conversation.avatar;
    }
    // Pour les conversations directes, utiliser l'avatar de l'autre participant
    const otherMember = conversation.members?.find(m => m?.user?.id && m.user.id !== user?.id);
    return otherMember?.user?.avatar || '/assets/images/avatar/1.png';
  };

  const filteredConversations = conversations
    .filter(conv => {
      const title = getConversationTitle(conv).toLowerCase();
      const matchesSearch = title.includes(searchQuery.toLowerCase());
      const matchesUnread = conversationFilter === 'Unread' ? (conv.unreadCount || 0) > 0 : true;

      const isHiddenBlockedDirect =
        conv.type === 'DIRECT' &&
        conv.otherUserIsBlocked &&
        selectedConversation?.id !== conv.id;

      return matchesSearch && matchesUnread && !isHiddenBlockedDirect;
    })
    .sort((a, b) => {
      if (conversationFilter === 'Oldest') {
        return new Date(a.lastMessageAt || a.updatedAt || 0) - new Date(b.lastMessageAt || b.updatedAt || 0);
      }

      return new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0);
    });

  const selectedConversationHasUnread = !!selectedConversation && (
    (selectedConversation.unreadCount || 0) > 0 ||
    messages.some(msg => !msg.isRead && String(msg.senderId || msg.sender?.id) !== String(user?.id))
  );

  const selectedConversationNotificationsMuted = !!selectedConversation?.notificationsMuted;
  const selectedConversationUserBlocked = !!selectedConversation?.otherUserIsBlocked;
  const isSendingBlocked = !!selectedConversation && selectedConversation.type === 'DIRECT' && selectedConversationUserBlocked;

  const selectedGroupMemberIds = new Set(
    (selectedConversation?.members || [])
      .map(m => m?.user?.id)
      .filter(Boolean)
  );

  const availableUsersToAdd = users.filter(u => !selectedGroupMemberIds.has(u.id));

  return (
    <>
      <main className="nxl-container apps-container apps-chat">
        <div className="nxl-content without-header nxl-full-content">
          <div className="main-content d-flex">
            {/* Sidebar - Liste des conversations */}
            <div className="content-sidebar content-sidebar-xl" data-scrollbar-target="#psScrollbarInit">
              <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
                <h4 className="fw-bolder mb-0">Chat</h4>
                <div className="hstack gap-2">
                  {/* Bouton Nouveau Chat avec Dropdown */}
                  <div className="dropdown">
                    <button 
                      className="btn btn-sm btn-primary rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ width: '32px', height: '32px' }}
                      type="button" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                      title="Nouvelle conversation"
                    >
                      <i className="feather-plus"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <a 
                          className="dropdown-item" 
                          href="#" 
                          data-bs-toggle="modal" 
                          data-bs-target="#newChatModal"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            loadUsers(); 
                          }}
                        >
                          <i className="feather-message-circle me-2"></i>
                          Nouvelle discussion
                        </a>
                      </li>
                      <li>
                        <a 
                          className="dropdown-item" 
                          href="#" 
                          data-bs-toggle="modal" 
                          data-bs-target="#newGroupModal"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            loadUsers(); 
                          }}
                        >
                          <i className="feather-users me-2"></i>
                          Nouveau groupe
                        </a>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <a
                          className="dropdown-item d-flex align-items-center justify-content-between"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenBlockedUsersModal();
                          }}
                        >
                          <span>
                            <i className="feather-slash me-2"></i>
                            Personnes bloquées
                          </span>
                          {blockedUsersCount > 0 && (
                            <span className="badge bg-danger rounded-pill ms-2">
                              {blockedUsersCount}
                            </span>
                          )}
                        </a>
                      </li>
                    </ul>
                  </div>
                  <a href="#" onClick={(e) => e.preventDefault()} className="app-sidebar-close-trigger d-flex">
                    <i className="feather-x"></i>
                  </a>
                </div>
              </div>
              
              <div className="content-sidebar-body">
                <div className="py-0 px-4 d-flex align-items-center justify-content-between border-bottom">
                  <form className="sidebar-search" onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="search"
                      className="py-3 px-0 border-0"
                      id="chattingSearch"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  <div className="dropdown sidebar-filter">
                    <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown" className="d-flex align-items-center justify-content-center dropdown-toggle" data-bs-offset="0, 15">
                      {conversationFilter}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end overflow-auto">
                      <li>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setConversationFilter('Newest'); }}
                          className={`dropdown-item ${conversationFilter === 'Newest' ? 'active' : ''}`}
                        >
                          Newest
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setConversationFilter('Oldest'); }}
                          className={`dropdown-item ${conversationFilter === 'Oldest' ? 'active' : ''}`}
                        >
                          Oldest
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setConversationFilter('Unread'); }}
                          className={`dropdown-item ${conversationFilter === 'Unread' ? 'active' : ''}`}
                        >
                          Unread
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="content-sidebar-items">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-muted">
                      <i className="feather-message-circle fs-3 d-block mb-2"></i>
                      <p className="mb-0">Aucune conversation</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 d-flex position-relative border-bottom c-pointer single-item ${
                          selectedConversation?.id === conversation.id ? 'active' : ''
                        }`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="avatar-image">
                          <img
                            src={getConversationAvatar(conversation)}
                            className="img-fluid"
                            alt={getConversationTitle(conversation)}
                          />
                        </div>
                        <div className="ms-3 item-desc">
                          <div className="w-100 d-flex align-items-center justify-content-between">
                            <a href="#" onClick={(e) => e.preventDefault()} className="hstack gap-2 me-2">
                              <span className={conversation.unreadCount > 0 ? 'fw-bold' : ''}>{getConversationTitle(conversation)}</span>
                              <div className={`wd-5 ht-5 rounded-circle opacity-75 me-1 ${
                                conversation.type === 'GROUP' ? 'bg-info' : 'bg-success'
                              }`}></div>
                              {conversation.lastMessage && (
                                <span className="fs-10 fw-medium text-muted text-uppercase d-none d-sm-block">
                                  {formatMessageTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                              {conversation.unreadCount > 0 && (
                                <span className="badge bg-danger rounded-pill ms-1">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </a>
                            <div className="dropdown">
                              <a href="#" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className="avatar-text avatar-sm" data-bs-toggle="dropdown">
                                <i className="feather-more-vertical"></i>
                              </a>
                              <ul className="dropdown-menu dropdown-menu-end overflow-auto">
                                {conversation.unreadCount > 0 && (
                                  <li>
                                    <a 
                                      href="#" 
                                      onClick={(e) => { 
                                        e.preventDefault(); 
                                        e.stopPropagation(); 
                                        handleMarkConversationAsRead(conversation.id, true); 
                                      }} 
                                      className="dropdown-item"
                                    >
                                      <i className="feather-check-circle me-3"></i>
                                      <span>Marquer comme lu</span>
                                    </a>
                                  </li>
                                )}
                                {conversation.unreadCount === 0 && (
                                  <li>
                                    <a 
                                      href="#" 
                                      onClick={(e) => { 
                                        e.preventDefault(); 
                                        e.stopPropagation(); 
                                        handleMarkConversationAsRead(conversation.id, false); 
                                      }} 
                                      className="dropdown-item"
                                    >
                                      <i className="feather-eye-off me-3"></i>
                                      <span>Marquer comme non-lu</span>
                                    </a>
                                  </li>
                                )}
                                <li className="dropdown-divider"></li>
                                <li>
                                  <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleFeatureNotAvailable('Les favoris'); }} className="dropdown-item">
                                    <i className="feather-star me-3"></i>
                                    <span>Favoris</span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleConversationNotifications(conversation); }} className="dropdown-item">
                                    <i className={`feather-${conversation.notificationsMuted ? 'bell' : 'bell-off'} me-3`}></i>
                                    <span>{conversation.notificationsMuted ? 'Activer les notifications' : 'Désactiver les notifications'}</span>
                                  </a>
                                </li>
                                <li className="dropdown-divider"></li>
                                <li>
                                  <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteConversation(conversation); }} className="dropdown-item">
                                    <i className="feather-trash-2 me-3"></i>
                                    <span>Supprimer</span>
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <p className={`fs-12 mt-2 mb-0 text-truncate-2-line ${conversation.unreadCount > 0 ? 'fw-bold text-dark' : 'fw-semibold text-muted'}`}>
                            {conversation.lastMessage?.content || 'Aucun message pour le moment'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <a href="#" onClick={(e) => e.preventDefault()} className="content-sidebar-footer px-4 py-3 fs-11 text-uppercase d-block text-center">Load More</a>
            </div>

            {/* Zone principale - Messages */}
            <div className="content-area" data-scrollbar-target="#psScrollbarInit">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="content-area-header sticky-top">
                    <div className="page-header-left hstack gap-4">
                      <a href="#" onClick={(e) => e.preventDefault()} className="app-sidebar-open-trigger">
                        <i className="feather-align-left fs-20"></i>
                      </a>
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <div className="avatar-image">
                          <img
                            src={getConversationAvatar(selectedConversation)}
                            className="img-fluid"
                            alt={getConversationTitle(selectedConversation)}
                          />
                        </div>
                        <div className="d-none d-sm-block">
                          <div className="fw-bold d-flex align-items-center">
                            {getConversationTitle(selectedConversation)}
                          </div>
                          {selectedConversation.type === 'GROUP' ? (
                            <div className="fs-11 text-muted">
                              {selectedConversation.members?.length} membres
                            </div>
                          ) : (
                            <div className="d-flex align-items-center mt-1">
                              <span className="wd-7 ht-7 rounded-circle opacity-75 me-2 bg-success"></span>
                              <span className="fs-9 text-uppercase fw-bold text-success">ACTIVE NOW</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="page-header-right ms-auto">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('Les appels vocaux'); }} className="d-flex">
                          <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Appel vocal">
                            <i className="feather-phone-call"></i>
                          </div>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('Les appels vidéo'); }} className="d-flex">
                          <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Appel vidéo">
                            <i className="feather-video"></i>
                          </div>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('Les favoris'); }} className="d-flex d-none d-sm-block">
                          <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Favoris">
                            <i className="feather-star"></i>
                          </div>
                        </a>
                        <div className="dropdown">
                          <a href="#" onClick={(e) => e.preventDefault()} className="d-flex avatar-text avatar-md" data-bs-toggle="dropdown" data-bs-offset="0,15" title="Marquer comme lu/non-lu">
                            <i className="feather-eye"></i>
                          </a>
                          <div className="dropdown-menu dropdown-menu-end">
                            {selectedConversationHasUnread && (
                              <a href="#" onClick={(e) => { e.preventDefault(); handleMarkConversationAsRead(true); }} className="dropdown-item">
                                <i className="feather-check-circle me-3"></i>
                                <span>Marquer comme lu</span>
                              </a>
                            )}
                            {!selectedConversationHasUnread && (
                              <a href="#" onClick={(e) => { e.preventDefault(); handleMarkConversationAsRead(false); }} className="dropdown-item">
                                <i className="feather-eye-off me-3"></i>
                                <span>Marquer comme non-lu</span>
                              </a>
                            )}
                          </div>
                        </div>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('Les informations détaillées'); }} className="d-flex">
                          <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Informations">
                            <i className="feather-info"></i>
                          </div>
                        </a>
                        <div className="dropdown">
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-md" data-bs-toggle="dropdown" data-bs-offset="0,22">
                            <i className="feather-more-vertical"></i>
                          </a>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleOpenAddMemberModal(); }} className="dropdown-item">
                              <i className="feather-user-plus me-3"></i>
                              <span>Ajouter au groupe</span>
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleToggleConversationNotifications(); }} className="dropdown-item">
                              <i className={`feather-${selectedConversationNotificationsMuted ? 'bell' : 'bell-off'} me-3`}></i>
                              <span>{selectedConversationNotificationsMuted ? 'Activer les notifications' : 'Désactiver les notifications'}</span>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleToggleBlockUser(); }} className="dropdown-item">
                              <i className="feather-slash me-3"></i>
                              <span>{selectedConversationUserBlocked ? 'Débloquer' : 'Bloquer'}</span>
                            </a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteConversation(); }} className="dropdown-item">
                              <i className="feather-trash-2 me-3"></i>
                              <span>Supprimer la conversation</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="content-area-body">
                    {messages.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="feather-message-circle fs-1 text-muted d-block mb-3"></i>
                        <p className="text-muted">Aucun message dans cette conversation</p>
                        <p className="text-muted fs-12">Commencez à discuter !</p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        // Comparaison robuste des IDs (gère number et string)
                        const isOwnMessage = message.senderId ? 
                          String(message.senderId) === String(user?.id) : 
                          (message.sender?.id && String(message.sender.id) === String(user?.id));
                        
                        const previousMessage = index > 0 ? messages[index - 1] : null;
                        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                        
                        // Vérifier si c'est le même expéditeur que le message précédent (comparaison robuste)
                        const getPreviousSenderId = () => previousMessage?.senderId || previousMessage?.sender?.id;
                        const getMessageSenderId = () => message.senderId || message.sender?.id;
                        const getNextSenderId = () => nextMessage?.senderId || nextMessage?.sender?.id;
                        
                        const isSameSenderAsPrevious = previousMessage && 
                          String(getPreviousSenderId()) === String(getMessageSenderId());
                        const isSameSenderAsNext = nextMessage && 
                          String(getNextSenderId()) === String(getMessageSenderId());
                        
                        // Vérifier si les messages sont dans un intervalle court (moins de 2 minutes)
                        const isCloseTimeToPrevious = previousMessage && 
                          (new Date(message.createdAt) - new Date(previousMessage.createdAt)) < 120000; // 2 minutes
                        
                        const shouldShowHeader = !isSameSenderAsPrevious || !isCloseTimeToPrevious;
                        const isLastInGroup = !isSameSenderAsNext || 
                          (nextMessage && (new Date(nextMessage.createdAt) - new Date(message.createdAt)) >= 120000);
                        
                        if (message.type === 'SYSTEM') {
                          return (
                            <div key={message.id} className="text-center my-4">
                              <span className="badge bg-light text-muted p-2">
                                <i className="feather-info me-2"></i>
                                {message.content}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div key={message.id} className={`single-chat-item ${isLastInGroup ? 'mb-5' : 'mb-0'}`}>
                            {shouldShowHeader && (
                              <div className={`d-flex ${isOwnMessage ? 'flex-row-reverse' : ''} align-items-center gap-3 mb-3`}>
                                <a href="#" onClick={(e) => e.preventDefault()} className="avatar-image">
                                  <img
                                    src={message.sender?.avatar || '/assets/images/avatar/1.png'}
                                    className="img-fluid rounded-circle"
                                    alt={`${message.sender?.firstName} ${message.sender?.lastName}`}
                                  />
                                </a>
                                <div className={`d-flex ${isOwnMessage ? 'flex-row-reverse' : ''} align-items-center gap-2`}>
                                  <a href="#" onClick={(e) => e.preventDefault()}>{message.sender?.firstName} {message.sender?.lastName}</a>
                                  <span className="wd-5 ht-5 bg-gray-400 rounded-circle"></span>
                                  <span className="fs-11 text-muted">{formatMessageTime(message.createdAt)}</span>
                                </div>
                              </div>
                            )}
                            <div className={`wd-500 ${shouldShowHeader ? 'p-3' : 'px-3 pb-3 pt-0'} rounded-5 bg-gray-200 ${isOwnMessage ? 'ms-auto' : ''}`}>
                              {editingMessageId === message.id ? (
                                <div className="d-flex flex-column gap-2">
                                  <textarea
                                    className="form-control"
                                    rows="3"
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                  />
                                  <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-sm btn-light" onClick={handleCancelEditMessage}>Annuler</button>
                                    <button type="button" className="btn btn-sm btn-primary" onClick={() => handleSaveEditMessage(message.id)}>Enregistrer</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p
                                    className={`py-2 px-3 rounded-5 bg-white text-break ${!isLastInGroup ? 'mb-2' : 'mb-0'}`}
                                    style={{
                                      whiteSpace: 'pre-wrap',
                                      overflowWrap: 'anywhere',
                                      wordBreak: 'break-word'
                                    }}
                                  >
                                    {message.content}
                                  </p>
                                  <div className="d-flex align-items-center justify-content-between mt-1 px-2">
                                    <div className="d-flex align-items-center gap-2">
                                      {message.isEdited && (
                                        <span className="fs-11 text-muted">modifié</span>
                                      )}
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                      {isOwnMessage && (
                                        <span className={`fs-11 ${message.isRead ? 'text-primary' : 'text-muted'}`} title={message.isRead ? 'Lu' : 'Envoyé'}>
                                          <i className={`feather-${message.isRead ? 'check-circle' : 'check'}`}></i>
                                        </span>
                                      )}
                                      {message.type !== 'SYSTEM' && (
                                        <div className="dropdown">
                                          <a href="#" onClick={(e) => e.preventDefault()} className="text-muted" data-bs-toggle="dropdown">
                                            <i className="feather-more-vertical"></i>
                                          </a>
                                          <div className="dropdown-menu dropdown-menu-end">
                                            {isOwnMessage && !message.deletedForEveryone && (
                                              <a href="#" onClick={(e) => { e.preventDefault(); handleStartEditMessage(message); }} className="dropdown-item">
                                                <i className="feather-edit-2 me-2"></i>
                                                Modifier
                                              </a>
                                            )}
                                            {message.isEdited && (
                                              <a href="#" onClick={(e) => { e.preventDefault(); handleOpenMessageHistory(message); }} className="dropdown-item">
                                                <i className="feather-clock me-2"></i>
                                                Historique
                                              </a>
                                            )}
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteMessage(message.id, 'me'); }} className="dropdown-item">
                                              <i className="feather-trash me-2"></i>
                                              Supprimer pour moi
                                            </a>
                                            {isOwnMessage && !message.deletedForEveryone && (
                                              <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteMessage(message.id, 'everyone'); }} className="dropdown-item text-danger">
                                                <i className="feather-trash-2 me-2"></i>
                                                Supprimer pour tout le monde
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Zone de saisie */}
                  <div className="content-area-footer">
                    {isSendingBlocked && (
                      <div className="px-3 pt-2 pb-1 fs-12 text-danger">
                        Vous avez bloqué cet utilisateur. Débloquez-le pour envoyer des messages.
                      </div>
                    )}
                    <form onSubmit={handleSendMessage} className="d-flex align-items-center gap-2">
                      <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('Les commandes rapides'); }} className="d-flex">
                        <div className="wd-60 d-flex align-items-center justify-content-center" style={{ height: '59px' }}>
                          <i className="feather-hash"></i>
                        </div>
                      </a>
                      <div className="dropdown">
                        <a href="#" onClick={(e) => e.preventDefault()} className="d-flex" data-bs-toggle="dropdown" data-bs-offset="0, 15">
                          <div className="wd-60 d-flex align-items-center justify-content-center" style={{ height: '59px' }}>
                            <i className="feather-paperclip"></i>
                          </div>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-start">
                          <li>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('L\'envoi d\'image'); }} className="dropdown-item">
                              <i className="feather-image me-3"></i>Image
                            </a>
                          </li>
                          <li>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('L\'envoi de document'); }} className="dropdown-item">
                              <i className="feather-file me-3"></i>Document
                            </a>
                          </li>
                        </ul>
                      </div>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('Les messages vocaux'); }} className="d-flex">
                        <div className="wd-60 d-flex align-items-center justify-content-center" style={{ height: '59px' }}>
                          <i className="feather-mic"></i>
                        </div>
                      </a>
                      <input
                        type="text"
                        className="form-control border-0"
                        placeholder={isSendingBlocked ? 'Débloquez cet utilisateur pour écrire...' : 'Type your message here...'}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending || isSendingBlocked}
                      />
                      <a href="#" onClick={(e) => { e.preventDefault(); handleFeatureNotAvailable('Les emojis'); }} className="d-flex">
                        <div className="wd-60 d-flex align-items-center justify-content-center" style={{ height: '59px' }}>
                          <i className="feather-smile"></i>
                        </div>
                      </a>
                      <div className="border-start border-gray-5 send-message">
                        <button 
                          type="submit" 
                          className="wd-60 d-flex align-items-center justify-content-center border-0 bg-transparent"
                          style={{ height: '59px' }}
                          disabled={sending || isSendingBlocked || !newMessage.trim()}
                          data-bs-toggle="tooltip"
                          data-bs-trigger="hover"
                          title="Send Message"
                        >
                          {sending ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="feather-send"></i>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="text-center">
                    <i className="feather-message-circle" style={{ fontSize: '5rem', opacity: 0.3 }}></i>
                    <h4 className="mt-3 text-muted">Sélectionnez une conversation</h4>
                    <p className="text-muted">Choisissez une conversation pour commencer à discuter</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal Nouvelle conversation */}
      <div className="modal fade" id="newChatModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nouvelle conversation</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="list-group">
                {users.length === 0 ? (
                  <div className="text-center py-3 text-muted">Chargement...</div>
                ) : (
                  users.map((u) => (
                    <button
                      key={u.id}
                      className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                      onClick={() => handleCreateDirectChat(u.id)}
                      data-bs-dismiss="modal"
                    >
                      <div className="avatar-image">
                        <img src={u.avatar || '/assets/images/avatar/1.png'} className="img-fluid" alt={u.firstName} />
                      </div>
                      <div>
                        <div className="fw-bold">{u.firstName} {u.lastName}</div>
                        <div className="fs-12 text-muted">{u.email}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nouveau groupe */}
      <div className="modal fade" id="newGroupModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Créer un groupe</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom du groupe *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder="Ex: Équipe Marketing"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Description optionnelle du groupe"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Participants * (min. 2)</label>
                  <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {users.map((u) => (
                      <div key={u.id} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`user-${u.id}`}
                          checked={selectedUsers.some(su => su.id === u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, u]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(su => su.id !== u.id));
                            }
                          }}
                        />
                        <label className="form-check-label d-flex align-items-center gap-2" htmlFor={`user-${u.id}`}>
                          <div className="avatar-text avatar-sm bg-soft-primary text-primary">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <div className="fw-semibold">{u.firstName} {u.lastName}</div>
                            <div className="fs-12 text-muted">{u.email}</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="fs-12 text-muted mt-2">
                    {selectedUsers.length} participant(s) sélectionné(s)
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={!groupTitle.trim() || selectedUsers.length < 2}>
                  <i className="feather-users me-2"></i>
                  Créer le groupe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Historique des modifications */}
      {showHistoryModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Historique des modifications</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowHistoryModal(false);
                    setHistoryMessage(null);
                    setMessageHistory([]);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="fs-12 text-muted">Message actuel</div>
                  <div className="p-3 bg-light rounded">{historyMessage?.content}</div>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm"></span>
                  </div>
                ) : messageHistory.length === 0 ? (
                  <div className="text-muted">Aucune modification enregistrée.</div>
                ) : (
                  <div className="list-group">
                    {messageHistory.map((entry) => (
                      <div key={entry.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold">
                            {entry.editor?.firstName} {entry.editor?.lastName}
                          </span>
                          <span className="fs-12 text-muted">
                            {new Date(entry.editedAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <div className="fs-12 text-muted mb-1">Avant</div>
                        <div className="p-2 bg-light rounded mb-2">{entry.previousContent}</div>
                        <div className="fs-12 text-muted mb-1">Après</div>
                        <div className="p-2 bg-soft-primary rounded">{entry.newContent}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowHistoryModal(false);
                    setHistoryMessage(null);
                    setMessageHistory([]);
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter un membre */}
      {showAddMemberModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ajouter au groupe</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddMemberModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loadingUsers ? (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm"></span>
                  </div>
                ) : availableUsersToAdd.length === 0 ? (
                  <div className="text-muted">Aucun utilisateur disponible à ajouter.</div>
                ) : (
                  <div className="list-group">
                    {availableUsersToAdd.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className="list-group-item list-group-item-action d-flex align-items-center justify-content-between"
                        disabled={addingMember}
                        onClick={() => handleAddMemberToGroup(u.id)}
                      >
                        <span>{u.firstName} {u.lastName}</span>
                        <span className="fs-12 text-muted">{u.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddMemberModal(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Personnes bloquées */}
      {showBlockedUsersModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Personnes bloquées</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBlockedUsersModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loadingBlockedUsers ? (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm"></span>
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <div className="text-muted">Aucune personne bloquée.</div>
                ) : (
                  <div className="list-group">
                    {blockedUsers.map((blockedUser) => (
                      <div
                        key={blockedUser.id}
                        className="list-group-item d-flex align-items-center justify-content-between"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-image">
                            <img
                              src={blockedUser.avatar || '/assets/images/avatar/1.png'}
                              className="img-fluid rounded-circle"
                              alt={`${blockedUser.firstName} ${blockedUser.lastName}`}
                            />
                          </div>
                          <div>
                            <div className="fw-semibold">{blockedUser.firstName} {blockedUser.lastName}</div>
                            <div className="fs-12 text-muted">{blockedUser.email}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          disabled={unblockingUserId === blockedUser.id}
                          onClick={() => handleUnblockFromList(blockedUser.id)}
                        >
                          {unblockingUserId === blockedUser.id ? '...' : 'Débloquer'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBlockedUsersModal(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
