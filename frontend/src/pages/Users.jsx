import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

export default function Users() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'USER'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.createUser(formData);
      toast.success('Utilisateur créé avec succès !');
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(selectedUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive
      });
      toast.success('Utilisateur modifié avec succès !');
      setShowEditModal(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await adminService.updateUser(user.id, {
        ...user,
        isActive: !user.isActive
      });
      toast.success(`Utilisateur ${!user.isActive ? 'activé' : 'désactivé'}`);
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await adminService.deleteUser(userId);
      toast.success('Utilisateur supprimé');
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'USER'
    });
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'ADMIN': return 'badge bg-danger';
      case 'MANAGER': return 'badge bg-warning';
      case 'USER': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'ADMIN': return 'Administrateur';
      case 'MANAGER': return 'Manager';
      case 'USER': return 'Utilisateur';
      default: return role;
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Gestion des utilisateurs</h4>
          <p className="text-muted mb-0">Gérez les comptes et les droits d'accès</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="feather-plus me-2"></i>
            Nouvel utilisateur
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="feather-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">Tous les rôles</option>
                <option value="ADMIN">Administrateurs</option>
                <option value="MANAGER">Managers</option>
                <option value="USER">Utilisateurs</option>
              </select>
            </div>
            <div className="col-md-3">
              <div className="text-muted">
                <i className="feather-users me-2"></i>
                {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Inscription</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-sm me-3">
                            <div className="avatar-title bg-soft-primary text-primary rounded-circle">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                          </div>
                          <div>
                            <div className="fw-semibold">{user.firstName} {user.lastName}</div>
                            {user.id === currentUser?.id && (
                              <small className="text-muted">(Vous)</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        <span className={getRoleBadgeClass(user.role)}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        {user.isActive ? (
                          <span className="badge bg-success">Actif</span>
                        ) : (
                          <span className="badge bg-secondary">Inactif</span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </small>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openEditModal(user)}
                            title="Modifier"
                          >
                            <i className="feather-edit"></i>
                          </button>
                          <button
                            className={`btn ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleActive(user)}
                            title={user.isActive ? 'Désactiver' : 'Activer'}
                            disabled={user.id === currentUser?.id}
                          >
                            <i className={user.isActive ? 'feather-user-x' : 'feather-user-check'}></i>
                          </button>
                          {currentUser?.role === 'ADMIN' && user.id !== currentUser?.id && (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Supprimer"
                            >
                              <i className="feather-trash-2"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-5">
                  <i className="feather-users text-muted" style={{fontSize: '48px'}}></i>
                  <p className="text-muted mt-3">Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Création */}
      {showCreateModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvel utilisateur</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Prénom *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Nom d'utilisateur *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        minLength="3"
                        pattern="[a-zA-Z0-9_]+"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Mot de passe *</label>
                      <input
                        type="password"
                        className="form-control"
                        required
                        minLength="6"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Rôle *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                      >
                        <option value="USER">Utilisateur</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="feather-check me-2"></i>
                    Créer l'utilisateur
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedUser && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier l'utilisateur</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Prénom</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Rôle</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        disabled={selectedUser.id === currentUser?.id}
                      >
                        <option value="USER">Utilisateur</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                      {selectedUser.id === currentUser?.id && (
                        <small className="text-muted">Vous ne pouvez pas modifier votre propre rôle</small>
                      )}
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                          disabled={selectedUser.id === currentUser?.id}
                        />
                        <label className="form-check-label">
                          Compte actif
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => { setShowEditModal(false); resetForm(); }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="feather-save me-2"></i>
                    Enregistrer
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
