import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from '../i18n/I18nContext'

const SETTINGS_STORAGE_KEY = 'maccam-user-preferences'

const defaultSettings = {
  companyName: '',
  timezone: 'Europe/Paris',
  dateFormat: 'DD/MM/YYYY',
  startPage: '/',
  language: 'fr',
  compactSidebar: false,
  showOnlineStatus: true,
  emailDigest: true,
  desktopNotifications: true,
  weeklySummary: true,
  autoLogoutMinutes: 30,
  rememberSession: true,
}

export default function Settings() {
  const { user } = useAuthStore()
  const { t, language, setLanguage, supportedLanguages } = useI18n()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState({
    ...defaultSettings,
    companyName: user?.company || '',
    language,
  })

  useEffect(() => {
    const rawStoredSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!rawStoredSettings) return

    try {
      const parsed = JSON.parse(rawStoredSettings)
      setSettings((previous) => ({
        ...previous,
        ...parsed,
        companyName: parsed.companyName || user?.company || '',
      }))
    } catch {
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
    }
  }, [user?.company])

  const startPageOptions = useMemo(
    () => [
      { value: '/', label: 'Dashboard' },
      { value: '/profile', label: 'Mon profil' },
      { value: '/tasks', label: 'Tâches' },
      { value: '/projects', label: 'Projets' },
      { value: '/customers', label: 'Clients' },
      { value: '/analytics', label: 'Analytics' },
    ],
    [],
  )

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setSettings((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setLoading(true)
    setSuccess('')

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
      if (settings.language !== language) {
        setLanguage(settings.language)
      }
      setSuccess('Paramètres enregistrés avec succès.')
      setTimeout(() => setSuccess(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const resetDefaults = () => {
    const resetData = {
      ...defaultSettings,
      companyName: user?.company || '',
      language,
    }
    setSettings(resetData)
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(resetData))
    setSuccess('Paramètres réinitialisés.')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">{t('sidebar.settings')}</h5>
          </div>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Accueil</Link></li>
            <li className="breadcrumb-item">{t('sidebar.settings')}</li>
          </ul>
        </div>
      </div>

      <div className="main-content">
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="feather-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}

        <div className="row g-4">
          <div className="col-xxl-4 col-xl-5">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Raccourcis utiles</h5>
              </div>
              <div className="card-body d-flex flex-column gap-2">
                <Link to="/profile" className="btn btn-light text-start"><i className="feather-user me-2"></i>Détails du profil</Link>
                <Link to="/profile?tab=security" className="btn btn-light text-start"><i className="feather-shield me-2"></i>Sécurité du compte</Link>
                <Link to="/profile?tab=notifications" className="btn btn-light text-start"><i className="feather-bell me-2"></i>Notifications</Link>
                <Link to="/settings/email" className="btn btn-light text-start"><i className="feather-mail me-2"></i>Configuration email</Link>
                <Link to="/settings/seo" className="btn btn-light text-start"><i className="feather-globe me-2"></i>Paramètres SEO</Link>
                <Link to="/settings/tags" className="btn btn-light text-start"><i className="feather-tag me-2"></i>Gestion des tags</Link>
              </div>
            </div>

            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Compte</h5>
              </div>
              <div className="card-body">
                <p className="mb-2"><strong>Nom:</strong> {user?.firstName || '-'} {user?.lastName || ''}</p>
                <p className="mb-2"><strong>Email:</strong> {user?.email || '-'}</p>
                <p className="mb-0"><strong>Rôle:</strong> {user?.role || 'user'}</p>
              </div>
            </div>
          </div>

          <div className="col-xxl-8 col-xl-7">
            <form onSubmit={handleSubmit}>
              <div className="card stretch stretch-full">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h5 className="card-title mb-0">Préférences générales</h5>
                  <button type="button" className="btn btn-sm btn-light" onClick={resetDefaults}>Réinitialiser</button>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <label className="form-label">Nom de l'entreprise</label>
                      <input
                        type="text"
                        className="form-control"
                        name="companyName"
                        value={settings.companyName}
                        onChange={handleChange}
                        placeholder="MACCAM"
                      />
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label">Langue</label>
                      <select className="form-control" name="language" value={settings.language} onChange={handleChange}>
                        {supportedLanguages.map((item) => (
                          <option key={item.code} value={item.code}>{t(`languages.${item.code}`)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label">Fuseau horaire</label>
                      <select className="form-control" name="timezone" value={settings.timezone} onChange={handleChange}>
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="Europe/Brussels">Europe/Brussels</option>
                        <option value="Europe/Zurich">Europe/Zurich</option>
                        <option value="America/Toronto">America/Toronto</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label">Format de date</label>
                      <select className="form-control" name="dateFormat" value={settings.dateFormat} onChange={handleChange}>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label">Page de démarrage</label>
                      <select className="form-control" name="startPage" value={settings.startPage} onChange={handleChange}>
                        {startPageOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-4">
                      <label className="form-label">Déconnexion automatique (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="autoLogoutMinutes"
                        value={settings.autoLogoutMinutes}
                        onChange={handleChange}
                        min="5"
                        max="480"
                      />
                    </div>
                  </div>

                  <hr className="my-3" />

                  <div className="row">
                    <div className="col-md-6 mb-3 d-flex align-items-center justify-content-between">
                      <span className="fw-semibold">Sidebar compacte</span>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="compactSidebar" checked={settings.compactSidebar} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3 d-flex align-items-center justify-content-between">
                      <span className="fw-semibold">Afficher le statut en ligne</span>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="showOnlineStatus" checked={settings.showOnlineStatus} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3 d-flex align-items-center justify-content-between">
                      <span className="fw-semibold">Résumé email quotidien</span>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="emailDigest" checked={settings.emailDigest} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3 d-flex align-items-center justify-content-between">
                      <span className="fw-semibold">Notifications bureau</span>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="desktopNotifications" checked={settings.desktopNotifications} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3 d-flex align-items-center justify-content-between">
                      <span className="fw-semibold">Rapport hebdomadaire</span>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="weeklySummary" checked={settings.weeklySummary} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3 d-flex align-items-center justify-content-between">
                      <span className="fw-semibold">Se souvenir de la session</span>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" name="rememberSession" checked={settings.rememberSession} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light" onClick={resetDefaults} disabled={loading}>Annuler</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
