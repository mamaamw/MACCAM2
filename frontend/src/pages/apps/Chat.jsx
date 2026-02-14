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
  const [searchQuery, setSearchQuery] = useState('');
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
      const data = await chatService.getConversation(conversationId);
      setMessages(data.messages || []);
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
      toast.error('Erreur lors de l\'envoi du message');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const loadUsers = async () => {
    try {
      const data = await chatService.getUsers();
      setUsers(data.filter(u => u.id !== user?.id));
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
      console.error(error);
    }
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
    
    if (!groupTitle.trim() || selectedUsers.length < 2) {
      toast.error('Veuillez entrer un titre et sélectionner au moins 2 participants');
      return;
    }

    try {
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
      toast.error('Erreur lors de la création du groupe');
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
    const otherMember = conversation.members?.find(m => m.user.id !== user?.id);
    return otherMember ? `${otherMember.user.firstName} ${otherMember.user.lastName}` : 'Conversation';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'GROUP' && conversation.avatar) {
      return conversation.avatar;
    }
    // Pour les conversations directes, utiliser l'avatar de l'autre participant
    const otherMember = conversation.members?.find(m => m.user.id !== user?.id);
    return otherMember?.user.avatar || '/assets/images/avatar/1.png';
  };

  const filteredConversations = conversations.filter(conv => {
    const title = getConversationTitle(conv).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <main className="nxl-container apps-container apps-chat">
        <div className="nxl-content without-header nxl-full-content">
          <div className="main-content d-flex">
            {/* Sidebar - Liste des conversations */}
            <div className="content-sidebar content-sidebar-xl" data-scrollbar-target="#psScrollbarInit">
              <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
                <h4 className="fw-bolder mb-0">Chat</h4>
                <a href="#" onClick={(e) => e.preventDefault()} className="app-sidebar-close-trigger d-flex">
                  <i className="feather-x"></i>
                </a>
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
                      Newest
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end overflow-auto">
                      <li><a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item active">Newest</a></li>
                      <li><a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">Oldest</a></li>
                      <li><a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">Unread</a></li>
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
                              <span>{getConversationTitle(conversation)}</span>
                              <div className={`wd-5 ht-5 rounded-circle opacity-75 me-1 ${
                                conversation.type === 'GROUP' ? 'bg-info' : 'bg-success'
                              }`}></div>
                              {conversation.lastMessage && (
                                <span className="fs-10 fw-medium text-muted text-uppercase d-none d-sm-block">
                                  {formatMessageTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </a>
                            <div className="dropdown">
                              <a href="#" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className="avatar-text avatar-sm" data-bs-toggle="dropdown">
                                <i className="feather-more-vertical"></i>
                              </a>
                              <ul className="dropdown-menu dropdown-menu-end overflow-auto">
                                <li>
                                  <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                                    <i className="feather-check-circle me-3"></i>
                                    <span>Marquer comme lu</span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                                    <i className="feather-star me-3"></i>
                                    <span>Favoris</span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                                    <i className="feather-bell-off me-3"></i>
                                    <span>Notifications</span>
                                  </a>
                                </li>
                                <li className="dropdown-divider"></li>
                                <li>
                                  <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                                    <i className="feather-trash-2 me-3"></i>
                                    <span>Supprimer</span>
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                          <p className="fs-12 fw-semibold text-dark mt-2 mb-0 text-truncate-2-line">
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
                        <a href="#" onClick={(e) => e.preventDefault()} className="d-flex">
                          <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Appel vocal">
                            <i className="feather-phone-call"></i>
                          </div>
                        </a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="d-flex">
                          <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Appel vidéo">
                            <i className="feather-video"></i>
                          </div>
                        </a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="d-flex d-none d-sm-block">
                          <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Favoris">
                            <i className="feather-star"></i>
                          </div>
                        </a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="d-flex">
                          <div className="avatar-text avatar-md" data-bs-toggle="tooltip" data-bs-trigger="hover" title="Informations">
                            <i className="feather-info"></i>
                          </div>
                        </a>
                        <div className="dropdown">
                          <a href="#" onClick={(e) => e.preventDefault()} className="avatar-text avatar-md" data-bs-toggle="dropdown" data-bs-offset="0,22">
                            <i className="feather-more-vertical"></i>
                          </a>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                              <i className="feather-user-plus me-3"></i>
                              <span>Ajouter au groupe</span>
                            </a>
                            <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                              <i className="feather-bell-off me-3"></i>
                              <span>Notifications</span>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                              <i className="feather-slash me-3"></i>
                              <span>Bloquer</span>
                            </a>
                            <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
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
                        const isOwnMessage = message.sender?.id === user?.id;
                        const previousMessage = index > 0 ? messages[index - 1] : null;
                        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                        
                        // Vérifier si c'est le même expéditeur que le message précédent
                        const isSameSenderAsPrevious = previousMessage && previousMessage.sender?.id === message.sender?.id;
                        const isSameSenderAsNext = nextMessage && nextMessage.sender?.id === message.sender?.id;
                        
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
                              <p className={`py-2 px-3 rounded-5 bg-white ${!isLastInGroup ? 'mb-2' : 'mb-0'}`}>{message.content}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Zone de saisie */}
                  <div className="content-area-footer">
                    <form onSubmit={handleSendMessage} className="d-flex align-items-center gap-2">
                      <a href="#" onClick={(e) => e.preventDefault()} className="d-flex">
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
                            <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                              <i className="feather-image me-3"></i>Image
                            </a>
                          </li>
                          <li>
                            <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-item">
                              <i className="feather-file me-3"></i>Document
                            </a>
                          </li>
                        </ul>
                      </div>
                      <a href="#" onClick={(e) => e.preventDefault()} className="d-flex">
                        <div className="wd-60 d-flex align-items-center justify-content-center" style={{ height: '59px' }}>
                          <i className="feather-mic"></i>
                        </div>
                      </a>
                      <input
                        type="text"
                        className="form-control border-0"
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                      />
                      <a href="#" onClick={(e) => e.preventDefault()} className="d-flex">
                        <div className="wd-60 d-flex align-items-center justify-content-center" style={{ height: '59px' }}>
                          <i className="feather-smile"></i>
                        </div>
                      </a>
                      <div className="border-start border-gray-5 send-message">
                        <button 
                          type="submit" 
                          className="wd-60 d-flex align-items-center justify-content-center border-0 bg-transparent"
                          style={{ height: '59px' }}
                          disabled={sending || !newMessage.trim()}
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
    </>
  );
}
