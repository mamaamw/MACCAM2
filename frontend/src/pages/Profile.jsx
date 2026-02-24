import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import userService from '../services/userService'
import { useI18n } from '../i18n/I18nContext'
import { useSearchParams } from 'react-router-dom'

const VALID_TABS = ['profile', 'security', 'activity', 'notifications']

export default function Profile() {
  const { user, updateUser: updateAuthUser } = useAuthStore()
  const { t, language } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const getTabFromUrl = () => {
    const tab = searchParams.get('tab')
    return VALID_TABS.includes(tab) ? tab : 'profile'
  }

  const [activeTab, setActiveTab] = useState(getTabFromUrl)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activities, setActivities] = useState([])
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)
  
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
  
  // États pour les modes d'édition
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [tempFormData, setTempFormData] = useState({})

  // Charger le profil au montage
  useEffect(() => {
    loadProfile()
    loadActivities()
    loadNotificationSettings()
  }, [])

  useEffect(() => {
    const tabFromUrl = getTabFromUrl()
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams)
    if (tab === 'profile') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    setSearchParams(params, { replace: true })
  }

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
    } catch {
    }
  }

  const loadActivities = async () => {
    try {
      const response = await userService.getActivity()
      if (response.success) {
        setActivities(response.data)
      }
    } catch {
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
    } catch {
    }
  }

  const handleEditProfile = () => {
    setTempFormData({ ...formData })
    setIsEditingProfile(true)
  }

  const handleCancelEditProfile = () => {
    setFormData({ ...tempFormData })
    setIsEditingProfile(false)
  }

  const handleEditPassword = () => {
    setIsEditingPassword(true)
  }

  const handleCancelEditPassword = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setIsEditingPassword(false)
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
        setSuccess(t('profile.successProfileUpdated'))
        setTimeout(() => setSuccess(''), 3000)
        loadActivities() // Recharger les activités
        setIsEditingProfile(false)
      }
    } catch (err) {
      setError(err.message || t('profile.errorUpdating'))
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
      setError(t('profile.errorPwdMismatch'))
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
        setSuccess(t('profile.successPwdChanged'))
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSuccess(''), 3000)
        loadActivities() // Recharger les activités
        setIsEditingPassword(false)
      }
    } catch (err) {
      setError(err.message || t('profile.errorPwdChange'))
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
      setError(t('profile.errorNotifUpdate'))
      setTimeout(() => setError(''), 5000)
    }
  }

  const handle2FAToggle = async () => {
    try {
      const newValue = !twoFactorEnabled
      const response = await userService.toggle2FA(newValue)
      if (response.success) {
        setTwoFactorEnabled(newValue)
        setSuccess(newValue ? t('profile.twoFAEnabled') : t('profile.twoFADisabled'))
        setTimeout(() => setSuccess(''), 3000)
        loadActivities() // Recharger les activités
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification du 2FA')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError(t('profile.errorInvalidImage') || 'Veuillez sélectionner une image valide')
      setTimeout(() => setError(''), 5000)
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('profile.errorImageTooLarge') || 'L\'image est trop volumineuse (max 5MB)')
      setTimeout(() => setError(''), 5000)
      return
    }

    // Créer une prévisualisation
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Uploader l'image
    handleAvatarUpload(file)
  }

  const handleAvatarUpload = async (file) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await userService.uploadAvatar(file)
      if (response.success) {
        updateAuthUser(response.data)
        setSuccess(t('profile.successAvatarUpdated') || 'Photo de profil mise à jour avec succès')
        setTimeout(() => setSuccess(''), 3000)
        loadActivities()
      }
    } catch (err) {
      setError(err.message || t('profile.errorAvatarUpload') || 'Erreur lors de la mise à jour de la photo')
      setTimeout(() => setError(''), 5000)
      setAvatarPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!confirm(t('profile.confirmDeleteAvatar') || 'Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await userService.deleteAvatar()
      if (response.success) {
        updateAuthUser(response.data)
        setAvatarPreview(null)
        setSuccess(t('profile.successAvatarDeleted') || 'Photo de profil supprimée avec succès')
        setTimeout(() => setSuccess(''), 3000)
        loadActivities()
      }
    } catch (err) {
      setError(err.message || t('profile.errorAvatarDelete') || 'Erreur lors de la suppression de la photo')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    const localeByLanguage = {
      fr: 'fr-FR',
      en: 'en-US',
      nl: 'nl-NL',
      de: 'de-DE',
      es: 'es-ES',
    }

    if (hours < 1) return t('profile.fewMinutesAgo')
    if (hours < 24) return t('profile.hoursAgo', { count: hours })
    if (days === 1) return t('profile.yesterday')
    if (days < 7) return t('profile.daysAgo', { count: days })
    return date.toLocaleDateString(localeByLanguage[language] || 'fr-FR')
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
            <h5 className="m-b-10">{t('profile.pageTitle')}</h5>
          </div>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">{t('profile.breadcrumbHome')}</a></li>
            <li className="breadcrumb-item">{t('profile.breadcrumbProfile')}</li>
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
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-image avatar-xl position-relative" style={{ cursor: 'pointer' }} onClick={handleAvatarClick}>
                      <img 
                        src={avatarPreview || (user?.avatar ? `http://localhost:5000${user.avatar}` : '/assets/images/avatar/1.png')} 
                        alt={`${user?.firstName} ${user?.lastName}`} 
                        className="img-fluid" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%' }}
                      />
                      <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1" style={{ cursor: 'pointer' }}>
                        <i className="feather-camera text-white" style={{ fontSize: '14px' }}></i>
                      </div>
                    </div>
                    <div>
                      <div className="fw-bold mb-1 text-truncate-1-line">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="fs-11 fw-semibold text-primary text-truncate-1-line">@{user?.username}</div>
                      <div className="fs-12 fw-normal text-muted text-truncate-1-line">{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown">
                    <button type="button" className="btn btn-link d-flex p-0" data-bs-toggle="dropdown">
                      <i className="feather-more-vertical"></i>
                    </button>
                    <div className="dropdown-menu dropdown-menu-end">
                      <button type="button" className="dropdown-item" onClick={handleAvatarClick}>
                        <i className="feather-edit-3 me-3"></i>
                        <span>{t('profile.editPhoto')}</span>
                      </button>
                      <button type="button" className="dropdown-item" onClick={handleAvatarDelete}>
                        <i className="feather-trash-2 me-3"></i>
                        <span>{t('profile.deletePhoto')}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="fw-bold mb-2 text-dark">{t('profile.about')}</label>
                  <p className="fs-12 fw-normal text-muted">{formData.bio || t('profile.noBio')}</p>
                </div>
                <ul className="list-unstyled mb-4">
                  <li className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fw-semibold text-dark">
                      <i className="feather-mail me-2"></i>
                      {t('profile.email')}:
                    </span>
                    <span className="fs-12 text-muted">{user?.email}</span>
                  </li>
                  <li className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fw-semibold text-dark">
                      <i className="feather-phone me-2"></i>
                      {t('profile.phone')}:
                    </span>
                    <span className="fs-12 text-muted">{formData.phone || t('profile.notProvided')}</span>
                  </li>
                  <li className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fw-semibold text-dark">
                      <i className="feather-briefcase me-2"></i>
                      {t('profile.company')}:
                    </span>
                    <span className="fs-12 text-muted">{formData.company || t('profile.notProvided')}</span>
                  </li>
                  <li className="d-flex align-items-center justify-content-between">
                    <span className="fw-semibold text-dark">
                      <i className="feather-map-pin me-2"></i>
                      {t('profile.location')}:
                    </span>
                    <span className="fs-12 text-muted">{formData.city || t('profile.notProvided')}</span>
                  </li>
                </ul>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light-brand w-100" onClick={() => handleTabChange('profile')}>
                    <i className="feather-edit me-2"></i>
                    {t('profile.edit')}
                  </button>
                  <button type="button" className="btn btn-light w-100" onClick={() => handleTabChange('security')}>
                    <i className="feather-settings me-2"></i>
                    {t('profile.settings')}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">{t('profile.status')}</h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="fw-semibold text-dark">
                    <i className="wd-10 ht-10 border border-2 border-gray-1 bg-success rounded-circle me-2"></i>
                    {t('profile.active')}
                  </span>
                  <div className="custom-control custom-switch">
                    <input type="checkbox" className="custom-control-input" id="statusSwitch" defaultChecked />
                    <label className="custom-control-label" htmlFor="statusSwitch"></label>
                  </div>
                </div>
                <p className="fs-12 text-muted mb-0">{t('profile.onlineVisibility')}</p>
              </div>
            </div>
          </div>

          <div className="col-xxl-8 col-xl-12">
            {/* Tabs Navigation */}
            <div className="card stretch stretch-full">
              <div className="card-header">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button 
                      type="button"
                      className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                      onClick={() => handleTabChange('profile')}
                      role="tab"
                    >
                      <i className="feather-user me-2"></i>
                      {t('profile.tabInfo')}
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      type="button"
                      className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                      onClick={() => handleTabChange('security')}
                      role="tab"
                    >
                      <i className="feather-shield me-2"></i>
                      {t('profile.tabSecurity')}
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      type="button"
                      className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                      onClick={() => handleTabChange('activity')}
                      role="tab"
                    >
                      <i className="feather-activity me-2"></i>
                      {t('profile.tabActivity')}
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      type="button"
                      className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                      onClick={() => handleTabChange('notifications')}
                      role="tab"
                    >
                      <i className="feather-bell me-2"></i>
                      {t('profile.tabNotifications')}
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                <div className="tab-content">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="tab-pane fade show active">
                      {!isEditingProfile ? (
                        /* Mode Lecture */
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-4">
                            <h6 className="fw-bold">{t('profile.personalInformation')}</h6>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-primary"
                              onClick={handleEditProfile}
                            >
                              <i className="feather-edit me-2"></i>
                              {t('profile.edit')}
                            </button>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.firstName')}</label>
                              <p className="mb-0">{formData.firstName || '-'}</p>
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.lastName')}</label>
                              <p className="mb-0">{formData.lastName || '-'}</p>
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.email')}</label>
                              <p className="mb-0">{formData.email || '-'}</p>
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.username')}</label>
                              <p className="mb-0">@{formData.username || '-'}</p>
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.phone')}</label>
                              <p className="mb-0">{formData.phone || '-'}</p>
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.company')}</label>
                              <p className="mb-0">{formData.company || '-'}</p>
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.address')}</label>
                              <p className="mb-0">{formData.address || '-'}</p>
                            </div>
                            <div className="col-md-4 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.city')}</label>
                              <p className="mb-0">{formData.city || '-'}</p>
                            </div>
                            <div className="col-md-4 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.postalCode')}</label>
                              <p className="mb-0">{formData.postalCode || '-'}</p>
                            </div>
                            <div className="col-md-4 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.country')}</label>
                              <p className="mb-0">{formData.country || '-'}</p>
                            </div>
                            <div className="col-12 mb-4">
                              <label className="form-label fw-semibold text-muted">{t('profile.biography')}</label>
                              <p className="mb-0">{formData.bio || '-'}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Mode Édition */
                        <form onSubmit={handleSubmit}>
                          <div className="d-flex align-items-center justify-content-between mb-4">
                            <h6 className="fw-bold">{t('profile.editProfile')}</h6>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-4">
                              <label className="form-label">{t('profile.firstName')} <span className="text-danger">*</span></label>
                              <input 
                                type="text" 
                                className="form-control" 
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder={t('profile.yourFirstName')}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label">{t('profile.lastName')} <span className="text-danger">*</span></label>
                              <input 
                                type="text" 
                                className="form-control" 
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder={t('profile.yourLastName')}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label">{t('profile.email')} <span className="text-danger">*</span></label>
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
                              <label className="form-label">{t('profile.username')} <span className="text-danger">*</span></label>
                              <input 
                                type="text" 
                                className="form-control" 
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="johndoe"
                                pattern="[a-zA-Z0-9_]+"
                                title={t('profile.usernameHelp')}
                                minLength="3"
                                required
                              />
                              <small className="text-muted">{t('profile.usernameHelp')}</small>
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label">{t('profile.phone')}</label>
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
                              <label className="form-label">{t('profile.company')}</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder={t('profile.yourCompany')}
                              />
                            </div>
                            <div className="col-md-6 mb-4">
                              <label className="form-label">{t('profile.address')}</label>
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
                              <label className="form-label">{t('profile.city')}</label>
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
                              <label className="form-label">{t('profile.postalCode')}</label>
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
                              <label className="form-label">{t('profile.country')}</label>
                              <select 
                                className="form-control" 
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                              >
                                <option value="">{t('profile.selectCountry')}</option>
                                <option value="FR">{t('profile.countryFrance')}</option>
                                <option value="BE">{t('profile.countryBelgium')}</option>
                                <option value="CH">{t('profile.countrySwitzerland')}</option>
                                <option value="CA">{t('profile.countryCanada')}</option>
                              </select>
                            </div>
                            <div className="col-12 mb-4">
                              <label className="form-label">{t('profile.biography')}</label>
                              <textarea 
                                className="form-control" 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                placeholder={t('profile.tellAboutYou')}
                              ></textarea>
                            </div>
                            <div className="col-12">
                              <div className="d-flex gap-2 justify-content-end">
                                <button 
                                  type="button" 
                                  className="btn btn-light" 
                                  onClick={handleCancelEditProfile}
                                  disabled={loading}
                                >
                                  {t('profile.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                  {loading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      {t('profile.saving')}
                                    </>
                                  ) : (
                                    <>
                                      <i className="feather-save me-2"></i>
                                      {t('profile.saveChanges')}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div className="tab-pane fade show active">
                      {/* Section Mot de passe */}
                      <div className="mb-5">
                        {!isEditingPassword ? (
                          /* Mode Lecture */
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                              <div>
                                <h6 className="fw-bold mb-1">{t('profile.password')}</h6>
                                <p className="fs-12 text-muted mb-0">{t('profile.passwordDesc')}</p>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-primary"
                                onClick={handleEditPassword}
                              >
                                <i className="feather-edit me-2"></i>
                                {t('profile.changePassword')}
                              </button>
                            </div>
                            <div className="alert alert-info" role="alert">
                              <i className="feather-info me-2"></i>
                              {t('profile.passwordSecureMessage')}
                            </div>
                          </div>
                        ) : (
                          /* Mode Édition */
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                              <h6 className="fw-bold">{t('profile.changePassword')}</h6>
                            </div>
                            <form onSubmit={handlePasswordSubmit}>
                              <div className="row">
                                <div className="col-12 mb-4">
                                  <label className="form-label">{t('profile.currentPassword')} <span className="text-danger">*</span></label>
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
                                  <label className="form-label">{t('profile.newPassword')} <span className="text-danger">*</span></label>
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
                                  <label className="form-label">{t('profile.confirmPassword')} <span className="text-danger">*</span></label>
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
                                  <div className="d-flex gap-2 justify-content-end">
                                    <button 
                                      type="button" 
                                      className="btn btn-light" 
                                      onClick={handleCancelEditPassword}
                                      disabled={loading}
                                    >
                                      {t('profile.cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                      {loading ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                          {t('profile.updating')}
                                        </>
                                      ) : (
                                        <>
                                          <i className="feather-lock me-2"></i>
                                          {t('profile.updatePassword')}
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>

                      <hr className="my-5" />

                      <h6 className="fw-bold mb-4">{t('profile.twoFactor')}</h6>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <p className="fw-semibold mb-1">{t('profile.twoFactorTitle')}</p>
                          <p className="fs-12 text-muted mb-0">{t('profile.twoFactorDesc')}</p>
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
                      <h6 className="fw-bold mb-4">{t('profile.recentActivity')}</h6>
                      {activities.length === 0 ? (
                        <p className="text-muted">{t('profile.noRecentActivity')}</p>
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
                      <h6 className="fw-bold mb-4">{t('profile.notificationPreferences')}</h6>
                      <div className="list-group list-group-flush">
                        <div className="list-group-item d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="fw-semibold mb-1">{t('profile.emailNotifications')}</h6>
                            <p className="fs-12 text-muted mb-0">{t('profile.emailNotifDesc')}</p>
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
                            <h6 className="fw-semibold mb-1">{t('profile.newTasks')}</h6>
                            <p className="fs-12 text-muted mb-0">{t('profile.newTasksDesc')}</p>
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
                            <h6 className="fw-semibold mb-1">{t('profile.newLeads')}</h6>
                            <p className="fs-12 text-muted mb-0">{t('profile.newLeadsDesc')}</p>
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
                            <h6 className="fw-semibold mb-1">{t('profile.projectUpdates')}</h6>
                            <p className="fs-12 text-muted mb-0">{t('profile.projectUpdatesDesc')}</p>
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
                            <h6 className="fw-semibold mb-1">{t('profile.newsletter')}</h6>
                            <p className="fs-12 text-muted mb-0">{t('profile.newsletterDesc')}</p>
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
