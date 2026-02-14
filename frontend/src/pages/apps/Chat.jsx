import { useState, useEffect, useRef } from 'react';
import chatService from '../../services/chatService';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function Chat() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const messagesEndRef = useRef(null);

  // Charger les conversations au démarrage
  useEffect(() => {
    loadConversations();
  }, []);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des conversations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
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
      const message = await chatService.sendTextMessage(
        selectedConversation.id,
        newMessage.trim()
      );
      
      // Ajouter le message à la liste
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Mettre à jour la conversation dans la liste
      loadConversations();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
  };

  const loadUsers = async () => {
    try {
      const data = await chatService.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(error);
    }
  };

  const handleOpenNewChat = async () => {
    await loadUsers();
    setShowNewChatModal(true);
  };

  const handleOpenNewGroup = async () => {
    await loadUsers();
    setShowNewGroupModal(true);
  };

  const handleCreateDirectChat = async (userId) => {
    try {
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
    
    if (!groupTitle.trim() || selectedUsers.length === 0) {
      toast.error('Veuillez entrer un titre et sélectionner au moins un membre');
      return;
    }

    try {
      const conversation = await chatService.createGroup(
        groupTitle.trim(),
        selectedUsers,
        groupDescription.trim()
      );
      
      setConversations([conversation, ...conversations]);
      setSelectedConversation(conversation);
      setShowNewGroupModal(false);
      setGroupTitle('');
      setGroupDescription('');
      setSelectedUsers([]);
      toast.success('Groupe créé');
    } catch (error) {
      toast.error('Erreur lors de la création du groupe');
      console.error(error);
    }
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    // Moins de 24h : afficher l'heure
    if (diff < 24 * 60 * 60 * 1000) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Moins de 7 jours : afficher le jour
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    }
    
    // Plus vieux : afficher la date
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const getConversationTitle = (conversation) => {
    if (conversation.type === 'GROUP') {
      return conversation.title;
    }
    // Pour les conversations directes, afficher le nom de l'autre utilisateur
    return conversation.otherUser 
      ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      : 'Conversation';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'GROUP') {
      return conversation.avatar || null;
    }
    return conversation.otherUser?.avatar || null;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '500px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h2 className="page-header-title">Chat</h2>
              </div>
              <div className="col-auto">
                <button
                  className="btn btn-primary me-2"
                  onClick={handleOpenNewChat}
                >
                  <i className="feather-message-circle me-1"></i>
                  Nouvelle conversation
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleOpenNewGroup}
                >
                  <i className="feather-users me-1"></i>
                  Nouveau groupe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card" style={{height: '70vh'}}>
            <div className="row g-0 h-100">
              {/* Sidebar des conversations */}
              <div className="col-md-4 col-lg-3 border-end">
                <div className="d-flex flex-column h-100">
                  <div className="p-3 border-bottom">
                    <input
                      type="search"
                      className="form-control"
                      placeholder="Rechercher une conversation..."
                    />
                  </div>
                  
                  <div className="overflow-auto flex-grow-1">
                    {conversations.length === 0 ? (
                      <div className="text-center text-muted p-4">
                        <i className="feather-message-circle" style={{fontSize: '3rem'}}></i>
                        <p className="mt-3">Aucune conversation</p>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={handleOpenNewChat}
                        >
                          Démarrer une conversation
                        </button>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {conversations.map((conversation) => (
                          <button
                            key={conversation.id}
                            className={`list-group-item list-group-item-action ${
                              selectedConversation?.id === conversation.id ? 'active' : ''
                            }`}
                            onClick={() => handleSelectConversation(conversation)}
                          >
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-md me-3">
                                {getConversationAvatar(conversation) ? (
                                  <img
                                    src={getConversationAvatar(conversation)}
                                    alt="Avatar"
                                    className="rounded-circle"
                                  />
                                ) : (
                                  <div className="avatar-title bg-primary text-white rounded-circle">
                                    {conversation.type === 'GROUP' ? (
                                      <i className="feather-users"></i>
                                    ) : (
                                      getConversationTitle(conversation)[0]
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow-1 overflow-hidden">
                                <div className="d-flex justify-content-between align-items-start">
                                  <h6 className="mb-0 text-truncate">
                                    {getConversationTitle(conversation)}
                                  </h6>
                                  {conversation.lastMessage && (
                                    <small className="text-muted ms-2">
                                      {formatTime(conversation.lastMessage.createdAt)}
                                    </small>
                                  )}
                                </div>
                                {conversation.lastMessage && (
                                  <p className="mb-0 text-muted small text-truncate">
                                    {conversation.lastMessage.type === 'SYSTEM' ? (
                                      <em>{conversation.lastMessage.content}</em>
                                    ) : (
                                      conversation.lastMessage.content
                                    )}
                                  </p>
                                )}
                              </div>
                              {conversation.unreadCount > 0 && (
                                <span className="badge bg-primary rounded-pill ms-2">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Zone de messages */}
              <div className="col-md-8 col-lg-9">
                {selectedConversation ? (
                  <div className="d-flex flex-column h-100">
                    {/* Header de la conversation */}
                    <div className="p-3 border-bottom">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-md me-3">
                            {getConversationAvatar(selectedConversation) ? (
                              <img
                                src={getConversationAvatar(selectedConversation)}
                                alt="Avatar"
                                className="rounded-circle"
                              />
                            ) : (
                              <div className="avatar-title bg-primary text-white rounded-circle">
                                {selectedConversation.type === 'GROUP' ? (
                                  <i className="feather-users"></i>
                                ) : (
                                  getConversationTitle(selectedConversation)[0]
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="mb-0">{getConversationTitle(selectedConversation)}</h5>
                            {selectedConversation.type === 'GROUP' && (
                              <small className="text-muted">
                                {selectedConversation.members.length} membres
                              </small>
                            )}
                          </div>
                        </div>
                        <div>
                          <button className="btn btn-sm btn-outline-secondary">
                            <i className="feather-more-vertical"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow-1 overflow-auto p-3" style={{backgroundColor: '#f8f9fa'}}>
                      {messages.map((message) => {
                        const isOwn = message.senderId === user?.id;
                        const isSystem = message.type === 'SYSTEM';

                        if (isSystem) {
                          return (
                            <div key={message.id} className="text-center my-3">
                              <small className="text-muted">
                                <em>{message.content}</em>
                              </small>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={message.id}
                            className={`d-flex mb-3 ${isOwn ? 'justify-content-end' : ''}`}
                          >
                            {!isOwn && (
                              <div className="avatar avatar-sm me-2">
                                {message.sender?.avatar ? (
                                  <img
                                    src={message.sender.avatar}
                                    alt="Avatar"
                                    className="rounded-circle"
                                  />
                                ) : (
                                  <div className="avatar-title bg-secondary text-white rounded-circle">
                                    {message.sender?.firstName?.[0] || '?'}
                                  </div>
                                )}
                              </div>
                            )}
                            <div style={{maxWidth: '70%'}}>
                              {!isOwn && (
                                <div className="mb-1">
                                  <small className="text-muted">
                                    {message.sender?.firstName} {message.sender?.lastName}
                                  </small>
                                </div>
                              )}
                              <div
                                className={`p-2 rounded ${
                                  isOwn
                                    ? 'bg-primary text-white'
                                    : 'bg-white border'
                                }`}
                              >
                                <p className="mb-0">{message.content}</p>
                              </div>
                              <div className="mt-1">
                                <small className="text-muted">
                                  {formatTime(message.createdAt)}
                                </small>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input de message */}
                    <div className="p-3 border-top">
                      <form onSubmit={handleSendMessage}>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Écrivez un message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                          />
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={sending || !newMessage.trim()}
                          >
                            {sending ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <i className="feather-send"></i>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                    <div className="text-center">
                      <i className="feather-message-circle" style={{fontSize: '4rem'}}></i>
                      <p className="mt-3">Sélectionnez une conversation pour commencer</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal : Nouvelle conversation */}
      {showNewChatModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle conversation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowNewChatModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-3">Sélectionnez un utilisateur pour démarrer une conversation</p>
                <div className="list-group">
                  {users.map((usr) => (
                    <button
                      key={usr.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleCreateDirectChat(usr.id)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-sm me-3">
                          {usr.avatar ? (
                            <img src={usr.avatar} alt="Avatar" className="rounded-circle" />
                          ) : (
                            <div className="avatar-title bg-primary text-white rounded-circle">
                              {usr.firstName[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <h6 className="mb-0">{usr.firstName} {usr.lastName}</h6>
                          <small className="text-muted">{usr.email}</small>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal : Nouveau groupe */}
      {showNewGroupModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Créer un groupe</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowNewGroupModal(false);
                    setGroupTitle('');
                    setGroupDescription('');
                    setSelectedUsers([]);
                  }}
                ></button>
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
                    <label className="form-label">Description (optionnelle)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Description du groupe..."
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Membres *</label>
                    <p className="text-muted small">Sélectionnez au moins un membre</p>
                    <div className="list-group" style={{maxHeight: '300px', overflowY: 'auto'}}>
                      {users.map((usr) => (
                        <label
                          key={usr.id}
                          className={`list-group-item ${selectedUsers.includes(usr.id) ? 'active' : ''}`}
                          style={{cursor: 'pointer'}}
                        >
                          <div className="d-flex align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input me-3"
                              checked={selectedUsers.includes(usr.id)}
                              onChange={() => toggleUserSelection(usr.id)}
                            />
                            <div className="avatar avatar-sm me-3">
                              {usr.avatar ? (
                                <img src={usr.avatar} alt="Avatar" className="rounded-circle" />
                              ) : (
                                <div className="avatar-title bg-secondary text-white rounded-circle">
                                  {usr.firstName[0]}
                                </div>
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <div>{usr.firstName} {usr.lastName}</div>
                              <small className="text-muted">{usr.email}</small>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowNewGroupModal(false);
                      setGroupTitle('');
                      setGroupDescription('');
                      setSelectedUsers([]);
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!groupTitle.trim() || selectedUsers.length === 0}
                  >
                    <i className="feather-check me-1"></i>
                    Créer le groupe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
