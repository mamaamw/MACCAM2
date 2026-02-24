import { useAuthStore } from '../../stores/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { language, setLanguage, t, supportedLanguages } = useI18n()
  const navigate = useNavigate()

  const currentLanguage = supportedLanguages.find((item) => item.code === language) || supportedLanguages[0]
  const userAvatar = user?.avatar ? `http://localhost:5000${user.avatar}` : '/assets/images/avatar/1.png'
  const userDisplayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.username || user?.email || t('header.fallbackUser')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="nxl-header">
      <div className="header-wrapper">
        {/* Header Left */}
        <div className="header-left d-flex align-items-center gap-4">
          {/* Mobile Toggler */}
          <a href="#" onClick={(e) => e.preventDefault()} className="nxl-head-mobile-toggler" id="mobile-collapse">
            <div className="hamburger hamburger--arrowturn">
              <div className="hamburger-box">
                <div className="hamburger-inner"></div>
              </div>
            </div>
          </a>
          {/* Navigation Toggle */}
          <div className="nxl-navigation-toggle">
            <a className="nxl-head-link me-0" id="menu-mini-button">
              <i className="feather-align-left"></i>
            </a>
            <a className="nxl-head-link me-0" id="menu-expend-button" style={{ display: 'none' }}>
              <i className="feather-arrow-right"></i>
            </a>
          </div>
        </div>
        {/* Header Right */}
        <div className="header-right ms-auto">
          <div className="d-flex align-items-center">
            {/* Search */}
            <div className="dropdown nxl-h-item nxl-header-search">
              <a className="nxl-head-link me-0" data-bs-toggle="dropdown" href="#" role="button" data-bs-auto-close="outside">
                <i className="feather-search"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-search-dropdown">
                <div className="input-group search-form">
                  <span className="input-group-text">
                    <i className="feather-search fs-6 text-muted"></i>
                  </span>
                  <input type="text" className="form-control search-input-field" placeholder={t('header.searchPlaceholder')} />
                  <span className="input-group-text">
                    <button type="button" className="btn-close"></button>
                  </span>
                </div>
              </div>
            </div>
            {/* Language Dropdown */}
            <div className="dropdown nxl-h-item nxl-header-language d-none d-sm-flex">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-head-link me-0 nxl-language-link" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                <img src={`/assets/vendors/img/flags/4x3/${currentLanguage.flag}.svg`} alt="" className="img-fluid wd-20" />
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-language-dropdown">
                <div className="dropdown-divider mt-0"></div>
                <div className="language-items-wrapper">
                  <div className="select-language px-4 py-2 hstack justify-content-between gap-4">
                    <div className="lh-lg">
                      <h6 className="mb-0">{t('header.selectLanguage')}</h6>
                      <p className="fs-11 text-muted mb-0">{t('header.availableLanguages', { count: supportedLanguages.length })}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="px-3 py-2">
                    {supportedLanguages.map((item) => {
                      const isCurrent = language === item.code
                      return (
                        <a
                          key={item.code}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setLanguage(item.code)
                          }}
                          className={`dropdown-item d-flex align-items-center justify-content-between gap-2 rounded ${isCurrent ? 'active' : ''}`}
                        >
                          <span className="d-flex align-items-center gap-2">
                            <span className="avatar-image avatar-sm">
                              <img src={`/assets/vendors/img/flags/1x1/${item.flag}.svg`} alt="" className="img-fluid" />
                            </span>
                            <span>{t(`languages.${item.code}`)}</span>
                          </span>
                          {isCurrent ? <i className="feather-check"></i> : null}
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* Full Screen */}
            <div className="nxl-h-item d-none d-sm-flex">
              <div className="full-screen-switcher">
                <a href="#" className="nxl-head-link me-0" onClick={(e) => {
                  e.preventDefault();
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}>
                  <i className="feather-maximize maximize"></i>
                  <i className="feather-minimize minimize"></i>
                </a>
              </div>
            </div>
            {/* Dark/Light Theme */}
            <div className="nxl-h-item dark-light-theme">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-head-link me-0 dark-button">
                <i className="feather-moon"></i>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-head-link me-0 light-button" style={{ display: 'none' }}>
                <i className="feather-sun"></i>
              </a>
            </div>
            {/* Timesheets */}
            <div className="dropdown nxl-h-item">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-head-link me-0" data-bs-toggle="dropdown" role="button" data-bs-auto-close="outside">
                <i className="feather-clock"></i>
                <span className="badge bg-success nxl-h-badge">2</span>
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-timesheets-menu">
                <div className="d-flex justify-content-between align-items-center timesheets-head">
                  <h6 className="fw-bold text-dark mb-0">{t('header.timesheets')}</h6>
                  <a href="#" onClick={(e) => e.preventDefault()} className="fs-11 text-success text-end ms-auto" data-bs-toggle="tooltip" title={t('header.upcomingTimers')}>
                    <i className="feather-clock"></i>
                    <span>{t('header.upcomingCount')}</span>
                  </a>
                </div>
                <div className="d-flex justify-content-between align-items-center flex-column timesheets-body">
                  <i className="feather-clock fs-1 mb-4"></i>
                  <p className="text-muted">{t('header.noStartedTimers')}</p>
                  <a href="#" onClick={(e) => e.preventDefault()} className="btn btn-sm btn-primary">{t('header.startTimer')}</a>
                </div>
                <div className="text-center timesheets-footer">
                  <a href="#" onClick={(e) => e.preventDefault()} className="fs-13 fw-semibold text-dark">{t('header.allTimesheets')}</a>
                </div>
              </div>
            </div>
            {/* Notifications */}
            <div className="dropdown nxl-h-item">
              <a className="nxl-head-link me-3" data-bs-toggle="dropdown" href="#" role="button" data-bs-auto-close="outside">
                <i className="feather-bell"></i>
                <span className="badge bg-danger nxl-h-badge">3</span>
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-notifications-menu">
                <div className="d-flex justify-content-between align-items-center notifications-head">
                  <h6 className="fw-bold text-dark mb-0">{t('header.notifications')}</h6>
                  <a href="#" onClick={(e) => e.preventDefault()} className="fs-11 text-success text-end ms-auto" data-bs-toggle="tooltip" title={t('header.markAllRead')}>
                    <i className="feather-check"></i>
                    <span>{t('header.markAllRead')}</span>
                  </a>
                </div>
                <div className="notifications-item">
                  <img src="/assets/images/avatar/2.png" alt="" className="rounded me-3 border" />
                  <div className="notifications-desc">
                    <a href="#" onClick={(e) => e.preventDefault()} className="font-body text-truncate-2-line">
                      {" "}
                      <span className="fw-semibold text-dark">Malanie Hanvey</span> {t('header.notif1')}
                    </a>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="notifications-date text-muted border-bottom border-bottom-dashed">{t('header.minutesAgo2')}</div>
                      <div className="d-flex align-items-center float-end gap-2">
                        <a href="#" onClick={(e) => e.preventDefault()} className="d-block wd-8 ht-8 rounded-circle bg-gray-300" data-bs-toggle="tooltip" title={t('header.markAsRead')}></a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="text-danger" data-bs-toggle="tooltip" title={t('header.remove')}>
                          <i className="feather-x fs-12"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="notifications-item">
                  <img src="/assets/images/avatar/3.png" alt="" className="rounded me-3 border" />
                  <div className="notifications-desc">
                    <a href="#" onClick={(e) => e.preventDefault()} className="font-body text-truncate-2-line">
                      {" "}
                      <span className="fw-semibold text-dark">Valentine Maton</span> {t('header.notif2')}
                    </a>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="notifications-date text-muted border-bottom border-bottom-dashed">{t('header.minutesAgo36')}</div>
                      <div className="d-flex align-items-center float-end gap-2">
                        <a href="#" onClick={(e) => e.preventDefault()} className="d-block wd-8 ht-8 rounded-circle bg-gray-300" data-bs-toggle="tooltip" title={t('header.markAsRead')}></a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="text-danger" data-bs-toggle="tooltip" title={t('header.remove')}>
                          <i className="feather-x fs-12"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="notifications-item">
                  <img src="/assets/images/avatar/4.png" alt="" className="rounded me-3 border" />
                  <div className="notifications-desc">
                    <a href="#" onClick={(e) => e.preventDefault()} className="font-body text-truncate-2-line">
                      {" "}
                      <span className="fw-semibold text-dark">Archie Cantones</span> {t('header.notif3')}
                    </a>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="notifications-date text-muted border-bottom border-bottom-dashed">{t('header.minutesAgo53')}</div>
                      <div className="d-flex align-items-center float-end gap-2">
                        <a href="#" onClick={(e) => e.preventDefault()} className="d-block wd-8 ht-8 rounded-circle bg-gray-300" data-bs-toggle="tooltip" title={t('header.markAsRead')}></a>
                        <a href="#" onClick={(e) => e.preventDefault()} className="text-danger" data-bs-toggle="tooltip" title={t('header.remove')}>
                          <i className="feather-x fs-12"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center notifications-footer">
                  <a href="#" onClick={(e) => e.preventDefault()} className="fs-13 fw-semibold text-dark">{t('header.allNotifications')}</a>
                </div>
              </div>
            </div>
            {/* User Dropdown */}
            <div className="dropdown nxl-h-item">
              <a href="#" onClick={(e) => e.preventDefault()} data-bs-toggle="dropdown" role="button" data-bs-auto-close="outside">
                <img src={userAvatar} alt="user-image" className="img-fluid user-avtar me-0" style={{ objectFit: 'cover' }} />
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-user-dropdown">
                <div className="dropdown-header">
                  <div className="d-flex align-items-center">
                    <img src={userAvatar} alt="user-image" className="img-fluid user-avtar" style={{ objectFit: 'cover' }} />
                    <div>
                      <h6 className="text-dark mb-0">{userDisplayName} <span className="badge bg-soft-success text-success ms-1">PRO</span></h6>
                      <span className="fs-12 fw-medium text-muted">{user?.email || 'user@example.com'}</span>
                    </div>
                  </div>
                </div>
                <div className="dropdown-item-text">
                  <span className="hstack">
                    <i className="wd-10 ht-10 border border-2 border-gray-1 bg-success rounded-circle me-2"></i>
                    <span className="fw-semibold text-dark">{t('header.active')}</span>
                  </span>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/payment" className="dropdown-item">
                  <i className="feather-dollar-sign"></i>
                  <span>{t('header.subscriptions')}</span>
                </Link>
                <Link to="/profile" className="dropdown-item">
                  <i className="feather-user"></i>
                  <span>{t('header.profileDetails')}</span>
                </Link>
                <Link to="/cv" className="dropdown-item">
                  <i className="feather-file-text"></i>
                  <span>{t('header.myCv')}</span>
                </Link>
                <Link to="/profile?tab=activity" className="dropdown-item">
                  <i className="feather-activity"></i>
                  <span>{t('header.activityFeed')}</span>
                </Link>
                <Link to="/payment" className="dropdown-item">
                  <i className="feather-dollar-sign"></i>
                  <span>{t('header.billingDetails')}</span>
                </Link>
                <Link to="/profile?tab=notifications" className="dropdown-item">
                  <i className="feather-bell"></i>
                  <span>{t('header.notifications')}</span>
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <i className="feather-settings"></i>
                  <span>{t('header.accountSettings')}</span>
                </Link>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  <i className="feather-log-out"></i>
                  <span>{t('header.logout')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
