import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import userService from '../services/userService'

export default function Profile() {
  const { user, updateUser: updateAuthUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activities, setActivities] = useState([])
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    postalCode: user?.postalCode || '',
    bio: user?.bio || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskNotifications: true,
    leadNotifications: true,
    projectNotifications: true,
    newsletter: false
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Charger le profil au montage
  useEffect(() => {
    loadProfile()
    loadActivities()
    loadNotificationSettings()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile()
      if (response.success) {
        const userData = response.data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          username: userData.username || '',
          phone: userData.phone || '',
          company: userData.company || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || '',
          postalCode: userData.postalCode || '',
          bio: userData.bio || ''
        })
        setTwoFactorEnabled(userData.twoFactorEnabled || false)
        updateAuthUser(userData)
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err)
    }
  }

  const loadActivities = async () => {
    try {
      const response = await userService.getActivity()
      if (response.success) {
        setActivities(response.data)
      }
    } catch (err) {
      console.error('Erreur chargement activités:', err)
    }
  }

  const loadNotificationSettings = async () => {
    try {
      const response = await userService.getNotificationSettings()
      if (response.success) {
        setNotificationSettings({
          emailNotifications: response.data.emailNotifications,
          taskNotifications: response.data.taskNotifications,
          leadNotifications: response.data.leadNotifications,
          projectNotifications: response.data.projectNotifications,
          newsletter: response.data.newsletter
        })
      }
    } catch (err) {
      console.error('Erreur chargement notifications:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await userService.updateProfile(formData)
      if (response.success) {
        updateAuthUser(response.data)
        setSuccess('Profil mis à jour avec succès!')
        setTimeout(() => setSuccess(''), 3000)
        loadActivities() // Recharger les activités
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      setTimeout(() => setError(''), 5000)
      return
    }

    try {
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      if (response.success) {
        setSuccess('Mot de passe modifié avec succès!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSuccess(''), 3000)
        loadActivities() // Recharger les activités
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de mot de passe')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = async (key) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    }
    setNotificationSettings(newSettings)

    try {
      await userService.updateNotificationSettings(newSettings)
    } catch (err) {
      // Revenir à l'état précédent en cas d'erreur
      setNotificationSettings(notificationSettings)
      setError('Erreur lors de la mise à jour des notifications')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handle2FAToggle = async () => {
    try {
      const newValue = !twoFactorEnabled
      const response = await userService.toggle2FA(newValue)
      if (response.success) {
        setTwoFactorEnabled(newValue)
        setSuccess(`Authentification à deux facteurs ${newValue ? 'activée' : 'désactivée'}`)
        setTimeout(() => setSuccess(''), 3000)
        loadActivities() // Recharger les activités
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification du 2FA')
      setTimeout(() => setError(''), 5000)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return 'Il y a quelques minutes'
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`
    return date.toLocaleDateString('fr-FR')
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'profile_updated': return 'feather-user'
      case 'password_changed': return 'feather-lock'
      case '2fa_changed': return 'feather-shield'
      default: return 'feather-activity'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'profile_updated': return 'primary'
      case 'password_changed': return 'success'
      case '2fa_changed': return 'warning'
      default: return 'info'
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">Mon Profil</h5>
          </div>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Accueil</a></li>
            <li className="breadcrumb-item">Profil</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Messages de succès et d'erreur */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="feather-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="feather-alert-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <div className="row">
          <div className="col-xxl-4 col-xl-12">
            {/* Profile Card */}
            <div className="card stretch stretch-full">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-image avatar-xl">
                      <img src="/assets/images/avatar/1.png" alt="" className="img-fluid" />
                    </div>
                    <div>
                      <a href="javascript:void(0);" className="fw-bold mb-1 text-truncate-1-line">
                        {user?.firstName} {user?.lastName}
                      </a>
                      <div className="fs-11 fw-semibold text-primary text-truncate-1-line">@{user?.username}</div>
                      <div className="fs-12 fw-normal text-muted text-truncate-1-line">{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown">
                    <a href="javascript:void(0);" className="d-flex" data-bs-toggle="dropdown">
                      <i className="feather-more-vertical"></i>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a className="dropdown-item" href="javascript:void(0);">
                        <i className="feather-edit-3 me-3"></i>
                        <span>Modifier la photo</span>
                      </a>
                      <a className="dropdown-item" href="javascript:void(0);">
                        <i className="feather-trash-2 me-3"></i>
                        <span>Supprimer la photo</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="fw-bold mb-2 text-dark">À propos</label>
                  <p className="fs-12 fw-normal text-muted">{formData.bio || 'Aucune biographie renseignée.'}</p>
                </div>
                <ul className="list-unstyled mb-4">
                  <li className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fw-semibold text-dark">
                      <i className="feather-mail me-2"></i>
                      Email:
                    </span>
                    <span className="fs-12 text-muted">{user?.email}</span>
                  </li>
                  <li className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fw-semibold text-dark">
                      <i className="feather-phone me-2"></i>
                      Téléphone:
                    </span>
                    <span className="fs-12 text-muted">{formData.phone || 'Non renseigné'}</span>
                  </li>
                  <li className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fw-semibold text-dark">
                      <i className="feather-briefcase me-2"></i>
                      Entreprise:
                    </span>
                    <span className="fs-12 text-muted">{formData.company || 'Non renseigné'}</span>
                  </li>
                  <li className="d-flex align-items-center justify-content-between">
                    <span className="fw-semibold text-dark">
                      <i className="feather-map-pin me-2"></i>
                      Localisation:
                    </span>
                    <span className="fs-12 text-muted">{formData.city || 'Non renseigné'}</span>
                  </li>
                </ul>
                <div className="d-flex gap-2">
                  <a href="javascript:void(0);" className="btn btn-light-brand w-100" onClick={() => setActiveTab('profile')}>
                    <i className="feather-edit me-2"></i>
                    Modifier
                  </a>
                  <a href="javascript:void(0);" className="btn btn-light w-100" onClick={() => setActiveTab('security')}>
                    <i className="feather-settings me-2"></i>
                    Paramètres
                  </a>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Statut</h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="fw-semibold text-dark">
                    <i className="wd-10 ht-10 border border-2 border-gray-1 bg-success rounded-circle me-2"></i>
                    Actif
                  </span>
                  <div className="custom-control custom-switch">
                    <input type="checkbox" className="custom-control-input" id="statusSwitch" defaultChecked />
                    <label className="custom-control-label" htmlFor="statusSwitch"></label>
                  </div>
                </div>
                <p className="fs-12 text-muted mb-0">Vous apparaissez en ligne pour les autres utilisateurs</p>
              </div>
            </div>
          </div>

          <div className="col-xxl-8 col-xl-12">
            {/* Tabs Navigation */}
            <div className="card stretch stretch-full">
              <div className="card-header">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <a 
                      className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                      onClick={() => setActiveTab('profile')}
                      role="tab"
                      href="javascript:void(0);"
                    >
                      <i className="feather-user me-2"></i>
                      Informations
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a 
                      className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                      onClick={() => setActiveTab('security')}
                      role="tab"
                      href="javascript:void(0);"
                    >
                      <i className="feather-shield me-2"></i>
                      Sécurité
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a 
                      className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                      onClick={() => setActiveTab('activity')}
                      role="tab"
                      href="javascript:void(0);"
                    >
                      <i className="feather-activity me-2"></i>
                      Activité
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a 
                      className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                      onClick={() => setActiveTab('notifications')}
                      role="tab"
                      href="javascript:void(0);"
                    >
                      <i className="feather-bell me-2"></i>
                      Notifications
                    </a>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                <div className="tab-content">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="tab-pane fade show active">
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Prénom <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="Votre prénom"
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Nom <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Votre nom"
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Email <span className="text-danger">*</span></label>
                            <input 
                              type="email" 
                              className="form-control" 
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="votre@email.com"
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Nom d'utilisateur <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              placeholder="johndoe"
                              pattern="[a-zA-Z0-9_]+"
                              title="Uniquement des lettres, chiffres et underscores"
                              minLength="3"
                              required
                            />
                            <small className="text-muted">Au moins 3 caractères (lettres, chiffres et underscore uniquement)</small>
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Téléphone</label>
                            <input 
                              type="tel" 
                              className="form-control" 
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="+33 6 12 34 56 78"
                            />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Entreprise</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                              placeholder="Nom de votre entreprise"
                            />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Adresse</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="123 Rue Example"
                            />
                          </div>
                          <div className="col-md-4 mb-4">
                            <label className="form-label">Ville</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              placeholder="Paris"
                            />
                          </div>
                          <div className="col-md-4 mb-4">
                            <label className="form-label">Code Postal</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleChange}
                              placeholder="75001"
                            />
                          </div>
                          <div className="col-md-4 mb-4">
                            <label className="form-label">Pays</label>
                            <select 
                              className="form-control" 
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                            >
                              <option value="">Sélectionner...</option>
                              <option value="FR">France</option>
                              <option value="BE">Belgique</option>
                              <option value="CH">Suisse</option>
                              <option value="CA">Canada</option>
                            </select>
                          </div>
                          <div className="col-12 mb-4">
                            <label className="form-label">Biographie</label>
                            <textarea 
                              className="form-control" 
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              rows="4"
                              placeholder="Parlez-nous de vous..."
                            ></textarea>
                          </div>
                          <div className="col-12">
                            <div className="d-flex gap-2 justify-content-end">
                              <button type="button" className="btn btn-light" onClick={loadProfile}>Annuler</button>
                              <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Enregistrement...
                                  </>
                                ) : (
                                  <>
                                    <i className="feather-save me-2"></i>
                                    Enregistrer les modifications
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div className="tab-pane fade show active">
                      <h6 className="fw-bold mb-4">Modifier le mot de passe</h6>
                      <form onSubmit={handlePasswordSubmit}>
                        <div className="row">
                          <div className="col-12 mb-4">
                            <label className="form-label">Mot de passe actuel</label>
                            <input 
                              type="password" 
                              className="form-control" 
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              placeholder="••••••••"
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Nouveau mot de passe</label>
                            <input 
                              type="password" 
                              className="form-control" 
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              placeholder="••••••••"
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label">Confirmer le mot de passe</label>
                            <input 
                              type="password" 
                              className="form-control" 
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              placeholder="••••••••"
                              required
                            />
                          </div>
                          <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Mise à jour...
                                </>
                              ) : (
                                <>
                                  <i className="feather-lock me-2"></i>
                                  Mettre à jour le mot de passe
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>

                      <hr className="my-5" />

                      <h6 className="fw-bold mb-4">Authentification à deux facteurs</h6>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <p className="fw-semibold mb-1">Sécurité renforcée</p>
                          <p className="fs-12 text-muted mb-0">Activez l'authentification à deux facteurs pour plus de sécurité</p>
                        </div>
                        <div className="custom-control custom-switch">
                          <input 
                            type="checkbox" 
                            className="custom-control-input" 
                            id="2faSwitch"
                            checked={twoFactorEnabled}
                            onChange={handle2FAToggle}
                          />
                          <label className="custom-control-label" htmlFor="2faSwitch"></label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activity Tab */}
                  {activeTab === 'activity' && (
                    <div className="tab-pane fade show active">
                      <h6 className="fw-bold mb-4">Activités récentes</h6>
                      {activities.length === 0 ? (
                        <p className="text-muted">Aucune activité récente</p>
                      ) : (
                        <div className="timeline-wrapper">
                          {activities.map((activity) => (
                            <div key={activity.id} className="timeline-item">
                              <div className={`timeline-icon bg-soft-${getActivityColor(activity.type)} text-${getActivityColor(activity.type)}`}>
                                <i className={getActivityIcon(activity.type)}></i>
                              </div>
                              <div className="timeline-content">
                                <h6 className="fw-semibold mb-1">{activity.description}</h6>
                                {activity.metadata && (
                                  <p className="fs-12 text-muted mb-0">{activity.metadata}</p>
                                )}
                                <span className="fs-11 text-muted">{formatDate(activity.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <div className="tab-pane fade show active">
                      <h6 className="fw-bold mb-4">Préférences de notifications</h6>
                      <div className="list-group list-group-flush">
                        <div className="list-group-item d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="fw-semibold mb-1">Notifications par email</h6>
                            <p className="fs-12 text-muted mb-0">Recevoir des notifications par email</p>
                          </div>
                          <div className="custom-control custom-switch">
                            <input 
                              type="checkbox" 
                              className="custom-control-input" 
                              id="emailNotif"
                              checked={notificationSettings.emailNotifications}
                              onChange={() => handleNotificationChange('emailNotifications')}
                            />
                            <label className="custom-control-label" htmlFor="emailNotif"></label>
                          </div>
                        </div>
                        <div className="list-group-item d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="fw-semibold mb-1">Nouvelles tâches</h6>
                            <p className="fs-12 text-muted mb-0">Être notifié quand une tâche vous est assignée</p>
                          </div>
                          <div className="custom-control custom-switch">
                            <input 
                              type="checkbox" 
                              className="custom-control-input" 
                              id="taskNotif"
                              checked={notificationSettings.taskNotifications}
                              onChange={() => handleNotificationChange('taskNotifications')}
                            />
                            <label className="custom-control-label" htmlFor="taskNotif"></label>
                          </div>
                        </div>
                        <div className="list-group-item d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="fw-semibold mb-1">Nouveaux leads</h6>
                            <p className="fs-12 text-muted mb-0">Être notifié des nouveaux leads</p>
                          </div>
                          <div className="custom-control custom-switch">
                            <input 
                              type="checkbox" 
                              className="custom-control-input" 
                              id="leadNotif"
                              checked={notificationSettings.leadNotifications}
                              onChange={() => handleNotificationChange('leadNotifications')}
                            />
                            <label className="custom-control-label" htmlFor="leadNotif"></label>
                          </div>
                        </div>
                        <div className="list-group-item d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="fw-semibold mb-1">Mises à jour de projets</h6>
                            <p className="fs-12 text-muted mb-0">Recevoir des mises à jour sur vos projets</p>
                          </div>
                          <div className="custom-control custom-switch">
                            <input 
                              type="checkbox" 
                              className="custom-control-input" 
                              id="projectNotif"
                              checked={notificationSettings.projectNotifications}
                              onChange={() => handleNotificationChange('projectNotifications')}
                            />
                            <label className="custom-control-label" htmlFor="projectNotif"></label>
                          </div>
                        </div>
                        <div className="list-group-item d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="fw-semibold mb-1">Newsletter</h6>
                            <p className="fs-12 text-muted mb-0">Recevoir la newsletter mensuelle</p>
                          </div>
                          <div className="custom-control custom-switch">
                            <input 
                              type="checkbox" 
                              className="custom-control-input" 
                              id="newsletterNotif"
                              checked={notificationSettings.newsletter}
                              onChange={() => handleNotificationChange('newsletter')}
                            />
                            <label className="custom-control-label" htmlFor="newsletterNotif"></label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
