import { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import chatService from '../../services/chatService';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { emojiCatalog, emojiCategoryOptions, normalizeEmojiSearchValue } from './chatEmojiData';

export default function Chat() {
  const { user, token } = useAuthStore();
  const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024;
  const GALLERY_ACTION_LOCK_MS = 150;
  const RECENT_EMOJIS_STORAGE_KEY = 'chat_recent_emojis_v1';
  const MAX_RECENT_EMOJIS = 24;
  const PRESENCE_HEARTBEAT_INTERVAL_MS = 30000;
  const TYPING_THROTTLE_MS = 2000;
  const SOCKET_SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

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
  const [showImageGalleryModal, setShowImageGalleryModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [emojiCategory, setEmojiCategory] = useState('ALL');
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryImageLoadError, setGalleryImageLoadError] = useState(false);
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
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const imageFileInputRef = useRef(null);
  const documentFileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const galleryActionLockedUntilRef = useRef(0);
  const socketRef = useRef(null);
  const selectedConversationIdRef = useRef(null);
  const currentUserIdRef = useRef(user?.id || null);
  const typingStateRef = useRef({
    conversationId: null,
    isTyping: false,
    lastSentAt: 0
  });

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversation?.id || null;
  }, [selectedConversation?.id]);

  useEffect(() => {
    currentUserIdRef.current = user?.id || null;
  }, [user?.id]);

  // Charger les conversations au démarrage
  useEffect(() => {
    loadConversations();
    loadBlockedUsers(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const sendHeartbeat = async () => {
      try {
        await chatService.heartbeatPresence();
      } catch {
      }
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(() => {
      if (!isMounted) return;
      sendHeartbeat();
    }, PRESENCE_HEARTBEAT_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(heartbeatInterval);
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !token) return;

    const socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('chat:message:new', (payload) => {
      const incomingConversationId = payload?.conversationId;
      const incomingMessage = payload?.message;

      if (!incomingConversationId || !incomingMessage?.id) return;

      setConversations(prev => {
        const next = [...prev];
        const targetIndex = next.findIndex(conv => conv.id === incomingConversationId);
        if (targetIndex >= 0) {
          const existing = next[targetIndex];
          next[targetIndex] = {
            ...existing,
            lastMessage: incomingMessage,
            lastMessageAt: incomingMessage.createdAt,
            unreadCount: String(incomingMessage.senderId || incomingMessage.sender?.id) === String(user?.id)
              ? (existing.unreadCount || 0)
              : (existing.unreadCount || 0) + 1
          };
          next.sort((a, b) => new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0));
        }
        return next;
      });

      setMessages(prev => {
        if (selectedConversationIdRef.current !== incomingConversationId) return prev;
        if (prev.some(msg => msg.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
    });

    socket.on('chat:presence:update', (payload) => {
      const presenceUserId = payload?.userId;
      if (!presenceUserId) return;

      setConversations(prev => prev.map(conv => {
        if (conv.type !== 'DIRECT') return conv;

        const hasTarget = (conv.otherUser?.id === presenceUserId)
          || conv.members?.some(member => member?.user?.id === presenceUserId);

        if (!hasTarget) return conv;

        return {
          ...conv,
          otherUser: conv.otherUser?.id === presenceUserId
            ? {
                ...conv.otherUser,
                isOnline: !!payload.isOnline,
                lastSeenAt: payload.lastSeenAt || conv.otherUser?.lastSeenAt || null,
                chatLastSeenAt: payload.lastSeenAt || conv.otherUser?.chatLastSeenAt || null
              }
            : conv.otherUser,
          members: (conv.members || []).map(member => (
            member?.user?.id === presenceUserId
              ? {
                  ...member,
                  user: {
                    ...member.user,
                    isOnline: !!payload.isOnline,
                    lastSeenAt: payload.lastSeenAt || member.user?.lastSeenAt || null,
                    chatLastSeenAt: payload.lastSeenAt || member.user?.chatLastSeenAt || null
                  }
                }
              : member
          ))
        };
      }));
    });

    socket.on('chat:typing:update', (payload) => {
      if (!payload?.conversationId || payload.conversationId !== selectedConversationIdRef.current) return;
      if (!payload?.userId || String(payload.userId) === String(currentUserIdRef.current)) return;

      setTypingUsers(prev => {
        if (payload.isTyping) {
          if (prev.some(typingUser => typingUser.id === payload.userId)) return prev;
          return [...prev, payload.user || { id: payload.userId }];
        }

        return prev.filter(typingUser => typingUser.id !== payload.userId);
      });
    });

    socket.on('connect', () => {
      const conversationIds = conversations.map(conv => conv.id).filter(Boolean);
      socket.emit('chat:subscribe', conversationIds);
    });

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [user?.id, token, SOCKET_SERVER_URL]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    const conversationIds = conversations.map(conv => conv.id).filter(Boolean);
    socket.emit('chat:subscribe', conversationIds);
  }, [conversations]);

  // Charger les messages uniquement quand l'ID de conversation change
  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id);
      setShowImageGalleryModal(false);
      setGalleryItems([]);
      setGalleryImageIndex(0);
      setShowEmojiPicker(false);
      setEmojiSearchQuery('');
      setEmojiCategory('ALL');
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    const currentConversationId = selectedConversation?.id || null;
    const previousConversationId = typingStateRef.current.conversationId;

    if (previousConversationId && previousConversationId !== currentConversationId && typingStateRef.current.isTyping) {
      socketRef.current?.emit('chat:typing:set', {
        conversationId: previousConversationId,
        isTyping: false
      });
      typingStateRef.current.isTyping = false;
      typingStateRef.current.lastSentAt = 0;
    }

    typingStateRef.current.conversationId = currentConversationId;
    setTypingUsers([]);
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!selectedConversation?.id) return;

    const refreshedSelected = conversations.find(conv => conv.id === selectedConversation.id);
    if (!refreshedSelected) return;

    setSelectedConversation(prev => {
      if (!prev || prev.id !== refreshedSelected.id) return prev;
      return {
        ...prev,
        ...refreshedSelected
      };
    });
  }, [conversations, selectedConversation?.id]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const galleryImages = galleryItems.length > 0
    ? galleryItems
    : messages.filter(message => message.type === 'IMAGE' && !!message.attachmentUrl);

  const isGalleryActionLocked = () => Date.now() < galleryActionLockedUntilRef.current;

  const emojiMapByValue = useMemo(() => {
    return new Map(emojiCatalog.map(item => [item.emoji, item]));
  }, []);

  const recentEmojiItems = useMemo(() => {
    return recentEmojis
      .map(emoji => emojiMapByValue.get(emoji))
      .filter(Boolean);
  }, [recentEmojis, emojiMapByValue]);

  const sanitizeRecentEmojis = (emojis) => {
    if (!Array.isArray(emojis)) return [];

    const unique = [];
    for (const emoji of emojis) {
      if (typeof emoji !== 'string') continue;
      if (!emojiMapByValue.has(emoji)) continue;
      if (unique.includes(emoji)) continue;
      unique.push(emoji);
      if (unique.length >= MAX_RECENT_EMOJIS) break;
    }

    return unique;
  };

  const filteredEmojis = useMemo(() => {
    const normalizedQuery = normalizeEmojiSearchValue(emojiSearchQuery.trim());
    const baseFiltered = emojiCatalog.filter(item => {
      const matchCategory = emojiCategory === 'ALL' || item.category === emojiCategory;
      const matchQuery = !normalizedQuery
        || item.emoji.includes(normalizedQuery)
        || item.searchTokens.includes(normalizedQuery);

      return matchCategory && matchQuery;
    });

    if (emojiCategory === 'RECENT') {
      return recentEmojiItems.filter(item => (
        !normalizedQuery
        || item.emoji.includes(normalizedQuery)
        || item.searchTokens.includes(normalizedQuery)
      ));
    }

    if (emojiCategory !== 'ALL' || normalizedQuery || recentEmojiItems.length === 0) {
      return baseFiltered;
    }

    const recentSet = new Set(recentEmojiItems.map(item => item.emoji));
    const remaining = baseFiltered.filter(item => !recentSet.has(item.emoji));
    return [...recentEmojiItems, ...remaining];
  }, [emojiSearchQuery, emojiCategory, recentEmojiItems]);

  useEffect(() => {
    let isMounted = true;

    const loadRecentEmojis = async () => {
      let localRecent = [];
      try {
        const rawRecentEmojis = localStorage.getItem(RECENT_EMOJIS_STORAGE_KEY);
        if (rawRecentEmojis) {
          localRecent = sanitizeRecentEmojis(JSON.parse(rawRecentEmojis));
        }
      } catch {
        localRecent = [];
      }

      try {
        const response = await chatService.getRecentEmojis();
        const serverRecent = sanitizeRecentEmojis(response?.emojis);

        if (!isMounted) return;

        if (serverRecent.length > 0 || localRecent.length === 0) {
          setRecentEmojis(serverRecent);
          localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(serverRecent));
          return;
        }

        setRecentEmojis(localRecent);
        chatService.updateRecentEmojis(localRecent).catch(() => {});
      } catch {
        if (!isMounted) return;
        setRecentEmojis(localRecent);
      }
    };

    loadRecentEmojis();

    return () => {
      isMounted = false;
    };
  }, [emojiMapByValue]);

  const lockGalleryAction = () => {
    galleryActionLockedUntilRef.current = Date.now() + GALLERY_ACTION_LOCK_MS;
  };

  const handleCloseImageGallery = () => {
    if (isGalleryActionLocked()) return;
    lockGalleryAction();
    setShowImageGalleryModal(false);
    setGalleryItems([]);
    setGalleryImageIndex(0);
    setGalleryImageLoadError(false);
  };

  useEffect(() => {
    if (!showImageGalleryModal) return;

    if (galleryImages.length === 0) {
      setShowImageGalleryModal(false);
      setGalleryItems([]);
      setGalleryImageIndex(0);
      setGalleryImageLoadError(false);
      return;
    }

    if (galleryImageIndex >= galleryImages.length) {
      setGalleryImageIndex(galleryImages.length - 1);
    }
  }, [showImageGalleryModal, galleryImages.length, galleryImageIndex]);

  useEffect(() => {
    if (!showImageGalleryModal) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseImageGallery();
      }
      if (event.key === 'ArrowLeft') {
        if (isGalleryActionLocked()) return;
        lockGalleryAction();
        setGalleryImageIndex(prev => (prev > 0 ? prev - 1 : prev));
      }
      if (event.key === 'ArrowRight') {
        if (isGalleryActionLocked()) return;
        lockGalleryAction();
        setGalleryImageIndex(prev => {
          const maxIndex = Math.max(0, galleryImages.length - 1);
          return prev < maxIndex ? prev + 1 : prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageGalleryModal, galleryImages.length]);

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
        setEmojiSearchQuery('');
        setEmojiCategory('ALL');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      if (!silent) {
        toast.error('Erreur lors du chargement des conversations');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await chatService.getConversation(conversationId);
      const loadedMessages = data.messages || [];
      const conversationInList = conversations.find(conv => conv.id === conversationId);
      const { messages: _ignoredMessages, ...conversationDetails } = data || {};
      const mergedConversation = {
        ...conversationInList,
        ...conversationDetails,
        unreadCount: conversationInList?.unreadCount ?? conversationDetails?.unreadCount ?? 0
      };

      setSelectedConversation(prev => (
        prev?.id === conversationId ? { ...prev, ...mergedConversation } : prev
      ));

      const hasUnreadIncoming = loadedMessages.some(
        msg => !msg.isRead && String(msg.senderId || msg.sender?.id) !== String(user?.id)
      );

      const hasUnreadBadge = (conversationInList?.unreadCount || 0) > 0;

      if (hasUnreadIncoming || hasUnreadBadge) {
        await chatService.markConversationAsRead(conversationId, true);

        setConversations(prev => prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ));

        setSelectedConversation(prev => (
          prev?.id === conversationId ? { ...prev, ...mergedConversation, unreadCount: 0 } : prev
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
      console.error('Erreur loadMessages:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur lors du chargement des messages';
      toast.error(errorMessage);
    }
  };

  const updateTypingStatus = async (isTyping, force = false) => {
    const conversationId = selectedConversation?.id;
    if (!conversationId) return;

    const now = Date.now();
    const shouldThrottle = !force && isTyping && typingStateRef.current.isTyping && (now - typingStateRef.current.lastSentAt) < TYPING_THROTTLE_MS;

    if (shouldThrottle) return;

    if (!force && typingStateRef.current.isTyping === isTyping && typingStateRef.current.conversationId === conversationId) {
      return;
    }

    typingStateRef.current.conversationId = conversationId;
    typingStateRef.current.isTyping = isTyping;
    typingStateRef.current.lastSentAt = now;

    socketRef.current?.emit('chat:typing:set', {
      conversationId,
      isTyping
    });
  };

  const handleMessageInputChange = (value) => {
    setNewMessage(value);

    const hasContent = value.trim().length > 0;
    if (!selectedConversation?.id || sending || isSendingBlocked) return;

    if (!hasContent) {
      updateTypingStatus(false, true);
      return;
    }

    updateTypingStatus(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await updateTypingStatus(false, true);
      const message = await chatService.sendTextMessage(selectedConversation.id, newMessage.trim());
      setMessages([...messages, message]);
      setNewMessage('');
      setShowEmojiPicker(false);
      setEmojiSearchQuery('');
      setEmojiCategory('ALL');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'envoi du message');
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
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Fermer la sidebar sur mobile après sélection
    if (window.innerWidth < 1200) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await chatService.getUsers();
      setUsers(data.filter(u => u.id !== user?.id));
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFeatureNotAvailable = (featureLabel) => {
    toast.info(`${featureLabel} sera disponible bientôt`);
  };

  const sendAttachmentMessage = async (file, type, fallbackContent) => {
    if (!selectedConversation?.id) {
      toast.error('Sélectionnez une conversation');
      return;
    }

    if (!file) return;

    if (file.size > MAX_ATTACHMENT_SIZE) {
      toast.error('Fichier trop volumineux (max 20 MB)');
      return;
    }

    try {
      setSending(true);
      const uploadResult = await chatService.uploadAttachment(selectedConversation.id, file);
      const attachmentUrl = uploadResult?.file?.url;

      if (!attachmentUrl) {
        throw new Error('URL de pièce jointe non reçue');
      }

      const message = await chatService.sendMessage(selectedConversation.id, {
        content: file.name || fallbackContent,
        type,
        attachmentUrl
      });
      setMessages(prev => [...prev, message]);
      toast.success('Pièce jointe envoyée');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'envoi de la pièce jointe');
    } finally {
      setSending(false);
    }
  };

  const handleInsertHash = () => {
    if (isSendingBlocked) return;

    const inputElement = messageInputRef.current;
    if (!inputElement) {
      setNewMessage(prev => `${prev}#`);
      return;
    }

    const start = inputElement.selectionStart ?? newMessage.length;
    const end = inputElement.selectionEnd ?? newMessage.length;
    const nextValue = `${newMessage.slice(0, start)}#${newMessage.slice(end)}`;
    setNewMessage(nextValue);

    requestAnimationFrame(() => {
      inputElement.focus();
      const cursorPos = start + 1;
      inputElement.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleToggleEmojiPicker = () => {
    if (isSendingBlocked) return;
    setShowEmojiPicker(prev => {
      const next = !prev;
      if (!next) {
        setEmojiSearchQuery('');
        setEmojiCategory('ALL');
      }
      return next;
    });
  };

  const handleInsertEmoji = (emoji) => {
    if (isSendingBlocked) return;

    setRecentEmojis(prev => {
      const nextRecent = [emoji, ...prev.filter(item => item !== emoji)].slice(0, MAX_RECENT_EMOJIS);
      try {
        localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(nextRecent));
      } catch {
      }
      chatService.updateRecentEmojis(nextRecent).catch(() => {});
      return nextRecent;
    });

    const inputElement = messageInputRef.current;
    if (!inputElement) {
      setNewMessage(prev => `${prev}${emoji}`);
      setShowEmojiPicker(false);
      setEmojiSearchQuery('');
      setEmojiCategory('ALL');
      return;
    }

    const start = inputElement.selectionStart ?? newMessage.length;
    const end = inputElement.selectionEnd ?? newMessage.length;
    const nextValue = `${newMessage.slice(0, start)}${emoji}${newMessage.slice(end)}`;
    setNewMessage(nextValue);
    setShowEmojiPicker(false);
    setEmojiSearchQuery('');
    setEmojiCategory('ALL');

    requestAnimationFrame(() => {
      inputElement.focus();
      const cursorPos = start + emoji.length;
      inputElement.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleMessageKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();

      const inputElement = messageInputRef.current;
      if (!inputElement) {
        setNewMessage(prev => `${prev}\n`);
        return;
      }

      const start = inputElement.selectionStart ?? newMessage.length;
      const end = inputElement.selectionEnd ?? newMessage.length;
      const nextValue = `${newMessage.slice(0, start)}\n${newMessage.slice(end)}`;
      setNewMessage(nextValue);

      requestAnimationFrame(() => {
        inputElement.focus();
        const cursorPos = start + 1;
        inputElement.setSelectionRange(cursorPos, cursorPos);
      });
      return;
    }

    event.preventDefault();
    if (sending || isSendingBlocked || !newMessage.trim()) return;
    handleSendMessage(event);
  };

  const handlePickImage = () => {
    if (isSendingBlocked) return;
    imageFileInputRef.current?.click();
  };

  const handlePickDocument = () => {
    if (isSendingBlocked) return;
    documentFileInputRef.current?.click();
  };

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await sendAttachmentMessage(file, 'IMAGE', 'Image');
    event.target.value = '';
  };

  const handleDocumentSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await sendAttachmentMessage(file, 'FILE', 'Document');
    event.target.value = '';
  };

  const handleToggleVoiceRecording = async () => {
    if (isSendingBlocked) return;

    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (!selectedConversation?.id) {
      toast.error('Sélectionnez une conversation');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toast.error('Enregistrement vocal non supporté sur ce navigateur');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) {
            return;
          }

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
          await sendAttachmentMessage(audioFile, 'AUDIO', 'Message vocal');
        } finally {
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
          }
          audioChunksRef.current = [];
          mediaRecorderRef.current = null;
          setIsRecording(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      toast.success('Enregistrement démarré');
    } catch (error) {
      toast.error('Impossible de démarrer l\'enregistrement');
      setIsRecording(false);
    }
  };

  const handleOpenImageInNewTab = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadImage = async (url, fileName) => {
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Impossible de télécharger le fichier');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const fallbackLink = document.createElement('a');
      fallbackLink.href = url;
      fallbackLink.download = fileName || `image-${Date.now()}.jpg`;
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      fallbackLink.remove();
      toast('Téléchargement lancé');
    }
  };

  const handleOpenImageGallery = (messageId, fallbackUrl) => {
    if (isGalleryActionLocked()) return;
    lockGalleryAction();

    const images = messages.filter(message => message.type === 'IMAGE' && !!message.attachmentUrl);
    if (images.length === 0) {
      if (fallbackUrl) {
        handleOpenImageInNewTab(fallbackUrl);
      } else {
        toast.error('Aucune image à prévisualiser');
      }
      return;
    }

    const index = images.findIndex(image => image.id === messageId);
    if (index < 0 && fallbackUrl) {
      handleOpenImageInNewTab(fallbackUrl);
      return;
    }

    setGalleryImageLoadError(false);
    setGalleryItems(images);
    setGalleryImageIndex(index >= 0 ? index : 0);
    setShowImageGalleryModal(true);
  };

  const handlePreviousGalleryImage = () => {
    if (isGalleryActionLocked()) return;
    lockGalleryAction();
    setGalleryImageLoadError(false);
    setGalleryImageIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextGalleryImage = () => {
    if (isGalleryActionLocked()) return;
    lockGalleryAction();
    setGalleryImageLoadError(false);
    setGalleryImageIndex(prev => {
      const maxIndex = Math.max(0, galleryImages.length - 1);
      return prev < maxIndex ? prev + 1 : prev;
    });
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
    } finally {
      setAddingMember(false);
    }
  };

  const handleLeaveSelectedGroup = async (conversationArg = null) => {
    const conversationToLeave = conversationArg || selectedConversation;

    if (!conversationToLeave || conversationToLeave.type !== 'GROUP') {
      toast.error('Aucun groupe sélectionné');
      return;
    }

    const confirmed = window.confirm('Voulez-vous vraiment quitter ce groupe ?');
    if (!confirmed) return;

    try {
      await chatService.leaveGroup(conversationToLeave.id, user?.id);

      setConversations(prev => prev.filter(conv => conv.id !== conversationToLeave.id));

      if (selectedConversation?.id === conversationToLeave.id) {
        setSelectedConversation(null);
        setMessages([]);
      }

      toast.success('Vous avez quitté le groupe');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la sortie du groupe');
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
    }
  };

  const formatMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'À L\'INSTANT';
    if (diffInMinutes < 60) return `IL Y A ${diffInMinutes} MIN`;
    if (diffInHours < 24) return `IL Y A ${diffInHours} H`;
    if (diffInDays < 7) return `IL Y A ${diffInDays} J`;
    return messageDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase();
  };

  const formatLastSeenFull = (date) => {
    if (!date) return 'Hors ligne';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return 'Hors ligne';

    return `Vu le ${parsedDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })} à ${parsedDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const getDirectPresence = (conversation) => {
    const directUser = conversation?.otherUser
      || conversation?.members?.find(member => member?.user?.id && member.user.id !== user?.id)?.user
      || null;

    const isOnline = !!directUser?.isOnline;
    const lastSeenAt = directUser?.lastSeenAt || directUser?.chatLastSeenAt || null;

    if (isOnline) {
      return {
        isOnline: true,
        dotClass: 'bg-success',
        labelClass: 'text-success',
        shortLabel: 'EN LIGNE',
        fullLabel: 'En ligne'
      };
    }

    return {
      isOnline: false,
      lastSeenAt,
      dotClass: 'bg-secondary',
      labelClass: 'text-muted',
      shortLabel: lastSeenAt ? `VU ${formatMessageTime(lastSeenAt)}` : 'HORS LIGNE',
      fullLabel: formatLastSeenFull(lastSeenAt)
    };
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

  const selectedTypingLabel = useMemo(() => {
    if (!selectedConversation?.id || typingUsers.length === 0) return null;

    if (selectedConversation.type === 'DIRECT') {
      return 'En train d\'écrire…';
    }

    const typingNames = typingUsers
      .map(typingUser => `${typingUser.firstName || ''} ${typingUser.lastName || ''}`.trim())
      .filter(Boolean);

    if (typingNames.length === 0) {
      return 'Quelqu\'un est en train d\'écrire…';
    }

    if (typingNames.length === 1) {
      return `${typingNames[0]} écrit…`;
    }

    if (typingNames.length === 2) {
      return `${typingNames[0]} et ${typingNames[1]} écrivent…`;
    }

    return `${typingNames[0]}, ${typingNames[1]} et ${typingNames.length - 2} autres écrivent…`;
  }, [selectedConversation?.id, selectedConversation?.type, typingUsers]);

  const selectedGroupMembers = selectedConversation?.type === 'GROUP'
    ? (selectedConversation.members || [])
        .map(member => member?.user)
        .filter(Boolean)
    : [];

  const selectedGroupMembersLabel = selectedGroupMembers.length > 0
    ? selectedGroupMembers
        .map(member => `${member.firstName || ''} ${member.lastName || ''}`.trim())
        .filter(Boolean)
        .join(', ')
    : 'Aucun membre';

  const selectedConversationNotificationsMuted = !!selectedConversation?.notificationsMuted;
  const selectedConversationUserBlocked = !!selectedConversation?.otherUserIsBlocked;
  const selectedDirectPresence = selectedConversation?.type === 'DIRECT'
    ? getDirectPresence(selectedConversation)
    : null;
  const isSendingBlocked = !!selectedConversation && selectedConversation.type === 'DIRECT' && selectedConversationUserBlocked;
  const activeGalleryImage = galleryImages[galleryImageIndex] || null;
  const activeGalleryDownloadName = activeGalleryImage
    ? (activeGalleryImage.content && activeGalleryImage.content !== 'Image'
      ? activeGalleryImage.content
      : `image-${galleryImageIndex + 1}.jpg`)
    : 'image.jpg';

  const selectedGroupMemberIds = new Set(
    (selectedConversation?.members || [])
      .map(m => m?.user?.id)
      .filter(Boolean)
  );

  const availableUsersToAdd = users.filter(u => !selectedGroupMemberIds.has(u.id));

  return (
    <>
      <main
        className="nxl-container apps-container apps-chat"
        style={{ top: 0, marginLeft: 0, minHeight: '100vh' }}
      >
        <div className="nxl-content without-header nxl-full-content" style={{ padding: 0, margin: 0 }}>
          <div className="main-content d-flex" style={{ overflow: 'hidden', padding: 0, margin: 0, gap: 0, height: '100vh' }}>
            {/* Sidebar - Liste des conversations */}
            <div className={`content-sidebar content-sidebar-xl ${isSidebarOpen ? 'app-sidebar-open' : ''}`} data-scrollbar-target="#psScrollbarInit" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
              <div className="content-sidebar-header bg-white hstack justify-content-between" style={{ flexShrink: 0 }}>
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
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsSidebarOpen(false); }} className="app-sidebar-close-trigger d-flex">
                    <i className="feather-x"></i>
                  </a>
                </div>
              </div>
              
              <div className="content-sidebar-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <div className="py-0 px-4 d-flex align-items-center justify-content-between border-bottom">
                  <form className="sidebar-search" onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="search"
                      className="py-3 px-0 border-0"
                      id="chattingSearch"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  <div className="dropdown sidebar-filter">
                    <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown" className="d-flex align-items-center justify-content-center dropdown-toggle" data-bs-offset="0, 15">
                      {conversationFilter === 'Newest'
                        ? 'Récentes'
                        : conversationFilter === 'Oldest'
                          ? 'Anciennes'
                          : 'Non lues'}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end overflow-auto">
                      <li>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setConversationFilter('Newest'); }}
                          className={`dropdown-item ${conversationFilter === 'Newest' ? 'active' : ''}`}
                        >
                          Récentes
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setConversationFilter('Oldest'); }}
                          className={`dropdown-item ${conversationFilter === 'Oldest' ? 'active' : ''}`}
                        >
                          Anciennes
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); setConversationFilter('Unread'); }}
                          className={`dropdown-item ${conversationFilter === 'Unread' ? 'active' : ''}`}
                        >
                          Non lues
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
                              {conversation.type === 'DIRECT' && (
                                <>
                                  <div className={`wd-5 ht-5 rounded-circle opacity-75 me-1 ${getDirectPresence(conversation).dotClass}`}></div>
                                  <span
                                    className={`fs-10 fw-medium text-uppercase d-none d-sm-block ${getDirectPresence(conversation).labelClass}`}
                                    title={getDirectPresence(conversation).fullLabel}
                                  >
                                    {getDirectPresence(conversation).shortLabel}
                                  </span>
                                </>
                              )}
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
                                {conversation.type === 'GROUP' && (
                                  <li>
                                    <a
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleLeaveSelectedGroup(conversation);
                                      }}
                                      className="dropdown-item text-warning"
                                    >
                                      <i className="feather-log-out me-3"></i>
                                      <span>Quitter le groupe</span>
                                    </a>
                                  </li>
                                )}
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
              <a href="#" onClick={(e) => e.preventDefault()} className="content-sidebar-footer px-4 py-3 fs-11 text-uppercase d-block text-center" style={{ flexShrink: 0 }}>Charger plus</a>
            </div>

            {/* Zone principale - Messages */}
            <div className="content-area" data-scrollbar-target="#psScrollbarInit" style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="content-area-header border-bottom shadow-sm" style={{ flexShrink: 0, zIndex: 2, backgroundColor: '#fff', padding: '1rem 1.5rem' }}>
                    <div className="page-header-left hstack gap-3">
                      <a href="#" onClick={(e) => { e.preventDefault(); toggleSidebar(); }} className="app-sidebar-open-trigger">
                        <i className="feather-align-left fs-20"></i>
                      </a>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-image avatar-lg">
                          <img
                            src={getConversationAvatar(selectedConversation)}
                            className="img-fluid rounded-circle"
                            alt={getConversationTitle(selectedConversation)}
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <h5 className="mb-0 fw-bold">
                            {getConversationTitle(selectedConversation)}
                          </h5>
                          {selectedConversation?.type === 'GROUP' ? (
                            <div className="fs-12 text-muted d-none d-sm-block" title={selectedGroupMembersLabel}>
                              <span>{selectedConversation.members?.length || 0} membres</span>
                              {selectedTypingLabel && (
                                <span className="d-block text-primary fw-semibold">
                                  {selectedTypingLabel}
                                </span>
                              )}
                            </div>
                          ) : selectedConversation?.type === 'DIRECT' ? (
                            <>
                              <div className="d-flex align-items-center">
                                {selectedDirectPresence?.isOnline ? (
                                  <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                    <span className="wd-6 ht-6 rounded-circle bg-success"></span>
                                    En ligne
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.7rem' }}>
                                    Hors ligne
                                  </span>
                                )}
                              </div>
                              {selectedTypingLabel && (
                                <div className="fs-12 text-primary fw-semibold mt-1">
                                  {selectedTypingLabel}
                                </div>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="page-header-right ms-auto d-none d-md-block">
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
                            {selectedConversation?.type === 'GROUP' && (
                              <a href="#" onClick={(e) => { e.preventDefault(); handleOpenAddMemberModal(); }} className="dropdown-item">
                                <i className="feather-user-plus me-3"></i>
                                <span>Ajouter au groupe</span>
                              </a>
                            )}
                            {selectedConversation?.type === 'GROUP' && (
                              <a href="#" onClick={(e) => { e.preventDefault(); handleLeaveSelectedGroup(); }} className="dropdown-item text-warning">
                                <i className="feather-log-out me-3"></i>
                                <span>Quitter le groupe</span>
                              </a>
                            )}
                            <a href="#" onClick={(e) => { e.preventDefault(); handleToggleConversationNotifications(); }} className="dropdown-item">
                              <i className={`feather-${selectedConversationNotificationsMuted ? 'bell' : 'bell-off'} me-3`}></i>
                              <span>{selectedConversationNotificationsMuted ? 'Activer les notifications' : 'Désactiver les notifications'}</span>
                            </a>
                            {selectedConversation?.type === 'DIRECT' && (
                              <>
                                <div className="dropdown-divider"></div>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleToggleBlockUser(); }} className="dropdown-item">
                                  <i className="feather-slash me-3"></i>
                                  <span>{selectedConversationUserBlocked ? 'Débloquer' : 'Bloquer'}</span>
                                </a>
                              </>
                            )}
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
                  <div className="content-area-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '110px' }}>
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
                          <div key={message.id} className={`single-chat-item ${isLastInGroup ? 'mb-5' : 'mb-0'}`} style={{ overflow: 'visible' }}>
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
                                  {message.type === 'IMAGE' && message.attachmentUrl && (
                                    <div className="mb-2">
                                      <button
                                        type="button"
                                        className="p-0 border-0 bg-transparent"
                                        onClick={() => handleOpenImageGallery(message.id, message.attachmentUrl)}
                                      >
                                        <img
                                          src={message.attachmentUrl}
                                          alt={message.content || 'Image'}
                                          className="img-fluid rounded-4 border"
                                          style={{ maxHeight: '260px', objectFit: 'cover', cursor: 'zoom-in' }}
                                        />
                                      </button>
                                    </div>
                                  )}
                                  {message.type === 'FILE' && message.attachmentUrl && (
                                    <a
                                      href={message.attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="d-inline-flex align-items-center gap-2 py-2 px-3 rounded-5 bg-white text-decoration-none mb-2"
                                    >
                                      <i className="feather-file-text"></i>
                                      <span className="text-break" style={{ overflowWrap: 'anywhere' }}>{message.content || 'Document'}</span>
                                    </a>
                                  )}
                                  {message.type === 'AUDIO' && message.attachmentUrl && (
                                    <div className="mb-2 p-2 bg-white rounded-4">
                                      <audio controls src={message.attachmentUrl} className="w-100" />
                                    </div>
                                  )}
                                  {(message.type === 'TEXT' || (message.type === 'IMAGE' && message.content)) && (
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
                                  )}
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
                  <div className="content-area-footer" style={{ flexShrink: 0, zIndex: 2, backgroundColor: '#fff' }}>
                    {isSendingBlocked && (
                      <div className="px-3 pt-2 pb-1 fs-12 text-danger">
                        Vous avez bloqué cet utilisateur. Débloquez-le pour envoyer des messages.
                      </div>
                    )}
                    <form onSubmit={handleSendMessage} className="d-flex align-items-center gap-2">
                      <a href="#" onClick={(e) => { e.preventDefault(); handleInsertHash(); }} className="d-flex" title="Insérer #">
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
                            <a href="#" onClick={(e) => { e.preventDefault(); handlePickImage(); }} className="dropdown-item">
                              <i className="feather-image me-3"></i>Image
                            </a>
                          </li>
                          <li>
                            <a href="#" onClick={(e) => { e.preventDefault(); handlePickDocument(); }} className="dropdown-item">
                              <i className="feather-file me-3"></i>Document
                            </a>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li className="px-3 py-2 fs-12 text-muted">Taille max: 20 MB</li>
                        </ul>
                      </div>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleToggleVoiceRecording(); }} className="d-flex" title={isRecording ? 'Arrêter l\'enregistrement' : 'Message vocal'}>
                        <div className="wd-60 d-flex align-items-center justify-content-center" style={{ height: '59px' }}>
                          <i className={`feather-${isRecording ? 'square' : 'mic'} ${isRecording ? 'text-danger' : ''}`}></i>
                        </div>
                      </a>
                      <textarea
                        ref={messageInputRef}
                        className="form-control border-0"
                        placeholder={isSendingBlocked ? 'Débloquez pour écrire' : 'Votre message...'}
                        value={newMessage}
                        onChange={(e) => handleMessageInputChange(e.target.value)}
                        onKeyDown={handleMessageKeyDown}
                        disabled={sending || isSendingBlocked}
                        rows={1}
                        style={{ minHeight: '59px', maxHeight: '140px', resize: 'none' }}
                      />
                      <div className="position-relative d-flex" ref={emojiPickerRef}>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleToggleEmojiPicker(); }} className="d-flex" title="Ajouter un emoji">
                          <div className="wd-60 d-flex align-items-center justify-content-center" style={{ height: '59px' }}>
                            <i className="feather-smile"></i>
                          </div>
                        </a>
                        {showEmojiPicker && !isSendingBlocked && (
                          <div
                            className="position-absolute bg-white border rounded-3 shadow-sm p-2"
                            style={{ right: 0, bottom: 'calc(100% + 8px)', width: '280px', zIndex: 20 }}
                          >
                            <input
                              type="text"
                              className="form-control form-control-sm mb-2"
                              placeholder="Rechercher emoji (FR/EN/NL/DE/ES)..."
                              value={emojiSearchQuery}
                              onChange={(e) => setEmojiSearchQuery(e.target.value)}
                            />
                            <div className="d-flex gap-1 mb-2" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                              {emojiCategoryOptions.map(category => (
                                <button
                                  key={category.id}
                                  type="button"
                                  className={`btn btn-sm ${emojiCategory === category.id ? 'btn-primary' : 'btn-light'}`}
                                  onClick={() => setEmojiCategory(category.id)}
                                  title={category.label}
                                  disabled={category.id === 'RECENT' && recentEmojiItems.length === 0}
                                  style={{ flexShrink: 0 }}
                                >
                                  <span className="me-1">{category.icon}</span>
                                  {category.label}
                                </button>
                              ))}
                            </div>
                            <div
                              className="d-flex flex-wrap gap-1"
                              style={{ maxHeight: '220px', overflowY: 'auto' }}
                            >
                              {filteredEmojis.map(item => (
                                <button
                                  key={item.emoji}
                                  type="button"
                                  className="btn btn-light btn-sm"
                                  style={{ width: '34px', height: '34px', lineHeight: 1 }}
                                  onClick={() => handleInsertEmoji(item.emoji)}
                                  title={item.emoji}
                                >
                                  {item.emoji}
                                </button>
                              ))}
                              {filteredEmojis.length === 0 && (
                                <div className="w-100 text-muted fs-12 text-center py-2">
                                  Aucun emoji trouvé
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="border-start border-gray-5 send-message">
                        <button 
                          type="submit" 
                          className="wd-60 d-flex align-items-center justify-content-center border-0 bg-transparent"
                          style={{ height: '59px' }}
                          disabled={sending || isSendingBlocked || !newMessage.trim()}
                          data-bs-toggle="tooltip"
                          data-bs-trigger="hover"
                          title="Envoyer le message"
                        >
                          {sending ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="feather-send"></i>
                          )}
                        </button>
                      </div>
                      <input
                        ref={imageFileInputRef}
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleImageSelected}
                      />
                      <input
                        ref={documentFileInputRef}
                        type="file"
                        className="d-none"
                        onChange={handleDocumentSelected}
                      />
                    </form>
                  </div>
                </>
              ) : (
                <>
                  {/* Header vide avec bouton menu */}
                  <div className="content-area-header border-bottom shadow-sm" style={{ flexShrink: 0, zIndex: 2, backgroundColor: '#fff', padding: '1rem 1.5rem' }}>
                    <div className="page-header-left hstack gap-3">
                      <a href="#" onClick={(e) => { e.preventDefault(); toggleSidebar(); }} className="app-sidebar-open-trigger">
                        <i className="feather-align-left fs-20"></i>
                      </a>
                      <h5 className="mb-0 text-muted fw-bold">Messagerie</h5>
                    </div>
                  </div>
                  {/* Message vide */}
                  <div className="d-flex align-items-center justify-content-center" style={{ flex: 1 }}>
                    <div className="text-center">
                      <i className="feather-message-circle" style={{ fontSize: '5rem', opacity: 0.3 }}></i>
                      <h4 className="mt-3 text-muted">Sélectionnez une conversation</h4>
                      <p className="text-muted">Choisissez une conversation pour commencer à discuter</p>
                    </div>
                  </div>
                </>
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

      {/* Modal Galerie images */}
      {showImageGalleryModal && activeGalleryImage && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }} onClick={handleCloseImageGallery}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(event) => event.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0">
                <h6 className="modal-title text-white">
                  Galerie ({galleryImageIndex + 1}/{galleryImages.length})
                </h6>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    onClick={() => handleDownloadImage(activeGalleryImage.attachmentUrl, activeGalleryDownloadName)}
                  >
                    <i className="feather-download me-1"></i>
                    Télécharger
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    onClick={() => handleOpenImageInNewTab(activeGalleryImage.attachmentUrl)}
                  >
                    <i className="feather-external-link me-1"></i>
                    Ouvrir
                  </button>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseImageGallery}
                  ></button>
                </div>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handlePreviousGalleryImage}
                    disabled={galleryImageIndex === 0}
                  >
                    <i className="feather-chevron-left"></i>
                  </button>

                  {galleryImageLoadError ? (
                    <div className="text-center text-white">
                      <p className="mb-2">Impossible de charger l'image dans la galerie.</p>
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={() => handleOpenImageInNewTab(activeGalleryImage.attachmentUrl)}
                      >
                        Ouvrir dans un nouvel onglet
                      </button>
                    </div>
                  ) : (
                    <img
                      src={activeGalleryImage.attachmentUrl}
                      alt={activeGalleryImage.content || 'Image'}
                      className="img-fluid rounded"
                      style={{ maxHeight: '70vh', objectFit: 'contain' }}
                      onError={() => setGalleryImageLoadError(true)}
                    />
                  )}

                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleNextGalleryImage}
                    disabled={galleryImageIndex >= galleryImages.length - 1}
                  >
                    <i className="feather-chevron-right"></i>
                  </button>
                </div>

                {galleryImages.length > 1 && (
                  <div className="d-flex align-items-center justify-content-center gap-2 mt-3 flex-wrap">
                    {galleryImages.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        className={`p-0 border-0 bg-transparent ${index === galleryImageIndex ? 'opacity-100' : 'opacity-50'}`}
                        onClick={() => {
                          if (isGalleryActionLocked()) return;
                          lockGalleryAction();
                          setGalleryImageLoadError(false);
                          setGalleryImageIndex(index);
                        }}
                      >
                        <img
                          src={image.attachmentUrl}
                          alt={image.content || `Image ${index + 1}`}
                          className="rounded border"
                          style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
