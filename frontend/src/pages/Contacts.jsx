import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactService } from '../services/contactService';
import ContactDetailModal from '../components/contacts/ContactDetailModal';
import toast from 'react-hot-toast';

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    secondaryEmail: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    phoneLabel: 'Mobile',
    secondaryPhone: '',
    secondaryPhoneLabel: 'Travail',
    company: '',
    jobTitle: '',
    website: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    birthDate: '',
    labels: '',
    bio: ''
  });
  const [activationData, setActivationData] = useState({
    password: '',
    role: 'USER'
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactService.getAllContacts();
      setContacts(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      await contactService.createContact(formData);
      toast.success('Contact créé avec succès !');
      setShowCreateModal(false);
      resetForm();
      loadContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleActivateContact = async (e) => {
    e.preventDefault();
    try {
      await contactService.activateContact(selectedContact.id, activationData);
      toast.success('Contact activé en tant qu\'utilisateur !');
      setShowActivateModal(false);
      setActivationData({ password: '', role: 'USER' });
      loadContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'activation');
    }
  };

  const handleDeactivateContact = async (contactId) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ? Il ne pourra plus se connecter.')) return;
    
    try {
      await contactService.deactivateContact(contactId);
      toast.success('Utilisateur désactivé avec succès');
      loadContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la désactivation');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;
    
    try {
      await contactService.deleteContact(contactId);
      toast.success('Contact supprimé');
      loadContacts();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openActivateModal = (contact) => {
    setSelectedContact(contact);
    setShowActivateModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      secondaryEmail: '',
      username: '',
      firstName: '',
      lastName: '',
      phone: '',
      phoneLabel: 'Mobile',
      secondaryPhone: '',
      secondaryPhoneLabel: 'Travail',
      company: '',
      jobTitle: '',
      website: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      birthDate: '',
      labels: '',
      bio: ''
    });
    setSelectedContact(null);
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && contact.isActive) ||
      (statusFilter === 'INACTIVE' && !contact.isActive);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-fluid p-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Contacts & Utilisateurs</h4>
          <p className="text-muted mb-0">Gérez vos contacts et vos utilisateurs en un seul endroit</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="feather-plus me-2"></i>
          Nouveau contact
        </button>
      </div>

      {/* Statistiques */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm me-3">
                  <div className="avatar-title bg-soft-primary text-primary rounded">
                    <i className="feather-users"></i>
                  </div>
                </div>
                <div>
                  <h6 className="mb-0">{contacts.length}</h6>
                  <small className="text-muted">Total</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm me-3">
                  <div className="avatar-title bg-soft-success text-success rounded">
                    <i className="feather-user-check"></i>
                  </div>
                </div>
                <div>
                  <h6 className="mb-0">{contacts.filter(c => c.isActive).length}</h6>
                  <small className="text-muted">Actifs</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm me-3">
                  <div className="avatar-title bg-soft-warning text-warning rounded">
                    <i className="feather-clock"></i>
                  </div>
                </div>
                <div>
                  <h6 className="mb-0">{contacts.filter(c => !c.isActive).length}</h6>
                  <small className="text-muted">Inactifs</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm me-3">
                  <div className="avatar-title bg-soft-info text-info rounded">
                    <i className="feather-shield"></i>
                  </div>
                </div>
                <div>
                  <h6 className="mb-0">{contacts.filter(c => c.role === 'ADMIN').length}</h6>
                  <small className="text-muted">Administrateurs</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="feather-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Utilisateurs actifs</option>
                <option value="INACTIVE">Contacts inactifs</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des contacts */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-5">
              <i className="feather-users text-muted" style={{fontSize: '48px'}}></i>
              <p className="text-muted mt-3">Aucun contact trouvé</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Entreprise</th>
                    <th>Localisation</th>
                    <th>Statut</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map(contact => (
                    <tr key={contact.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-sm me-3">
                            <div className="avatar-title bg-soft-info text-info rounded-circle">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </div>
                          </div>
                          <div>
                            <div className="fw-semibold">{contact.firstName} {contact.lastName}</div>
                            <small className="text-muted">@{contact.username}</small>
                            {contact.jobTitle && (
                              <div><small className="text-muted"><i className="feather-briefcase" style={{fontSize: '10px'}}></i> {contact.jobTitle}</small></div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{contact.email}</div>
                        {contact.secondaryEmail && (
                          <small className="text-muted">{contact.secondaryEmail}</small>
                        )}
                      </td>
                      <td>
                        {contact.phone ? (
                          <div>
                            <div>{contact.phone}</div>
                            {contact.phoneLabel && <small className="text-muted">{contact.phoneLabel}</small>}
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {contact.company ? (
                          <div>
                            <div>{contact.company}</div>
                            {contact.website && (
                              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                <small className="text-primary"><i className="feather-link" style={{fontSize: '10px'}}></i> Site web</small>
                              </a>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {contact.city && contact.country ? (
                          <small className="text-muted">{contact.city}, {contact.country}</small>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <span className={`badge ${
                            contact.role === 'ADMIN' ? 'bg-danger' : 
                            contact.role === 'MANAGER' ? 'bg-info' : 'bg-primary'
                          }`}>
                            <i className="feather-shield me-1"></i>
                            {contact.role === 'ADMIN' ? 'Administrateur' : contact.role === 'MANAGER' ? 'Gestionnaire' : 'Utilisateur'}
                          </span>
                          {contact.isActive ? (
                            <span className="badge bg-success">
                              <i className="feather-check-circle me-1"></i>
                              Actif
                            </span>
                          ) : (
                            <span className="badge bg-warning">
                              <i className="feather-clock me-1"></i>
                              En attente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/contacts/${contact.id}`)}
                            title="Voir / Modifier"
                          >
                            <i className="feather-eye"></i>
                          </button>
                          {!contact.isActive ? (
                            <button
                              className="btn btn-outline-success"
                              onClick={() => openActivateModal(contact)}
                              title="Activer"
                            >
                              <i className="feather-user-check"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => handleDeactivateContact(contact.id)}
                              title="Désactiver"
                            >
                              <i className="feather-user-x"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteContact(contact.id)}
                            title="Supprimer"
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Création */}
      {showCreateModal && (
        <ContactDetailModal
          key={`create-${Date.now()}`}
          mode="create"
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          onSave={() => {
            setShowCreateModal(false);
            resetForm();
            loadContacts();
          }}
        />
      )}

      {/* Modal Activation */}
      {showActivateModal && selectedContact && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Activer comme utilisateur</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => { setShowActivateModal(false); setActivationData({ password: '', role: 'USER' }); }}
                ></button>
              </div>
              <form onSubmit={handleActivateContact}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="feather-info me-2"></i>
                    Vous êtes sur le point d'activer le contact <strong>{selectedContact.firstName} {selectedContact.lastName}</strong> en tant qu'utilisateur de la plateforme.
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mot de passe *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      minLength="6"
                      value={activationData.password}
                      onChange={(e) => setActivationData({...activationData, password: e.target.value})}
                      placeholder="Entrez un mot de passe"
                    />
                    <small className="text-muted">Minimum 6 caractères</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Rôle *</label>
                    <select
                      className="form-select"
                      value={activationData.role}
                      onChange={(e) => setActivationData({...activationData, role: e.target.value})}
                    >
                      <option value="USER">Utilisateur</option>
                      <option value="MANAGER">Gestionnaire</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => { setShowActivateModal(false); setActivationData({ password: '', role: 'USER' }); }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="feather-user-check me-2"></i>
                    Activer l'utilisateur
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
