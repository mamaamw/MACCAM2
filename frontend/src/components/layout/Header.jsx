import { useAuthStore } from '../../stores/authStore'
import { useNavigate, Link } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

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
          <a href="javascript:void(0);" className="nxl-head-mobile-toggler" id="mobile-collapse">
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
                  <input type="text" className="form-control search-input-field" placeholder="Search...." />
                  <span className="input-group-text">
                    <button type="button" className="btn-close"></button>
                  </span>
                </div>
              </div>
            </div>
            {/* Language Dropdown */}
            <div className="dropdown nxl-h-item nxl-header-language d-none d-sm-flex">
              <a href="javascript:void(0);" className="nxl-head-link me-0 nxl-language-link" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                <img src="/assets/vendors/img/flags/4x3/us.svg" alt="" className="img-fluid wd-20" />
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-language-dropdown">
                <div className="dropdown-divider mt-0"></div>
                <div className="language-items-wrapper">
                  <div className="select-language px-4 py-2 hstack justify-content-between gap-4">
                    <div className="lh-lg">
                      <h6 className="mb-0">Select Language</h6>
                      <p className="fs-11 text-muted mb-0">12 languages available!</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="row px-4 pt-3">
                    <div className="col-sm-4 col-6 language_select active">
                      <a href="javascript:void(0);" className="d-flex align-items-center gap-2">
                        <div className="avatar-image avatar-sm"><img src="/assets/vendors/img/flags/1x1/us.svg" alt="" className="img-fluid" /></div>
                        <span>English</span>
                      </a>
                    </div>
                    <div className="col-sm-4 col-6 language_select">
                      <a href="javascript:void(0);" className="d-flex align-items-center gap-2">
                        <div className="avatar-image avatar-sm"><img src="/assets/vendors/img/flags/1x1/fr.svg" alt="" className="img-fluid" /></div>
                        <span>French</span>
                      </a>
                    </div>
                    <div className="col-sm-4 col-6 language_select">
                      <a href="javascript:void(0);" className="d-flex align-items-center gap-2">
                        <div className="avatar-image avatar-sm"><img src="/assets/vendors/img/flags/1x1/es.svg" alt="" className="img-fluid" /></div>
                        <span>Spanish</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Full Screen */}
            <div className="nxl-h-item d-none d-sm-flex">
              <div className="full-screen-switcher">
                <a href="javascript:void(0);" className="nxl-head-link me-0" onClick={(e) => {
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
              <a href="javascript:void(0);" className="nxl-head-link me-0 dark-button">
                <i className="feather-moon"></i>
              </a>
              <a href="javascript:void(0);" className="nxl-head-link me-0 light-button" style={{ display: 'none' }}>
                <i className="feather-sun"></i>
              </a>
            </div>
            {/* Timesheets */}
            <div className="dropdown nxl-h-item">
              <a href="javascript:void(0);" className="nxl-head-link me-0" data-bs-toggle="dropdown" role="button" data-bs-auto-close="outside">
                <i className="feather-clock"></i>
                <span className="badge bg-success nxl-h-badge">2</span>
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-timesheets-menu">
                <div className="d-flex justify-content-between align-items-center timesheets-head">
                  <h6 className="fw-bold text-dark mb-0">Timesheets</h6>
                  <a href="javascript:void(0);" className="fs-11 text-success text-end ms-auto" data-bs-toggle="tooltip" title="Upcoming Timers">
                    <i className="feather-clock"></i>
                    <span>3 Upcoming</span>
                  </a>
                </div>
                <div className="d-flex justify-content-between align-items-center flex-column timesheets-body">
                  <i className="feather-clock fs-1 mb-4"></i>
                  <p className="text-muted">No started timers found yet!</p>
                  <a href="javascript:void(0);" className="btn btn-sm btn-primary">Start Timer</a>
                </div>
                <div className="text-center timesheets-footer">
                  <a href="javascript:void(0);" className="fs-13 fw-semibold text-dark">All Timesheets</a>
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
                  <h6 className="fw-bold text-dark mb-0">Notifications</h6>
                  <a href="javascript:void(0);" className="fs-11 text-success text-end ms-auto" data-bs-toggle="tooltip" title="Make as Read">
                    <i className="feather-check"></i>
                    <span>Make as Read</span>
                  </a>
                </div>
                <div className="notifications-item">
                  <img src="/assets/images/avatar/2.png" alt="" className="rounded me-3 border" />
                  <div className="notifications-desc">
                    <a href="javascript:void(0);" className="font-body text-truncate-2-line">
                      {" "}
                      <span className="fw-semibold text-dark">Malanie Hanvey</span> We should talk about that at lunch!
                    </a>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="notifications-date text-muted border-bottom border-bottom-dashed">2 minutes ago</div>
                      <div className="d-flex align-items-center float-end gap-2">
                        <a href="javascript:void(0);" className="d-block wd-8 ht-8 rounded-circle bg-gray-300" data-bs-toggle="tooltip" title="Make as Read"></a>
                        <a href="javascript:void(0);" className="text-danger" data-bs-toggle="tooltip" title="Remove">
                          <i className="feather-x fs-12"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="notifications-item">
                  <img src="/assets/images/avatar/3.png" alt="" className="rounded me-3 border" />
                  <div className="notifications-desc">
                    <a href="javascript:void(0);" className="font-body text-truncate-2-line">
                      {" "}
                      <span className="fw-semibold text-dark">Valentine Maton</span> You can download the latest invoices now.
                    </a>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="notifications-date text-muted border-bottom border-bottom-dashed">36 minutes ago</div>
                      <div className="d-flex align-items-center float-end gap-2">
                        <a href="javascript:void(0);" className="d-block wd-8 ht-8 rounded-circle bg-gray-300" data-bs-toggle="tooltip" title="Make as Read"></a>
                        <a href="javascript:void(0);" className="text-danger" data-bs-toggle="tooltip" title="Remove">
                          <i className="feather-x fs-12"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="notifications-item">
                  <img src="/assets/images/avatar/4.png" alt="" className="rounded me-3 border" />
                  <div className="notifications-desc">
                    <a href="javascript:void(0);" className="font-body text-truncate-2-line">
                      {" "}
                      <span className="fw-semibold text-dark">Archie Cantones</span> Don't forget to pickup Jeremy after school!
                    </a>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="notifications-date text-muted border-bottom border-bottom-dashed">53 minutes ago</div>
                      <div className="d-flex align-items-center float-end gap-2">
                        <a href="javascript:void(0);" className="d-block wd-8 ht-8 rounded-circle bg-gray-300" data-bs-toggle="tooltip" title="Make as Read"></a>
                        <a href="javascript:void(0);" className="text-danger" data-bs-toggle="tooltip" title="Remove">
                          <i className="feather-x fs-12"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center notifications-footer">
                  <a href="javascript:void(0);" className="fs-13 fw-semibold text-dark">All Notifications</a>
                </div>
              </div>
            </div>
            {/* User Dropdown */}
            <div className="dropdown nxl-h-item">
              <a href="javascript:void(0);" data-bs-toggle="dropdown" role="button" data-bs-auto-close="outside">
                <img src="/assets/images/avatar/1.png" alt="user-image" className="img-fluid user-avtar me-0" />
              </a>
              <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-user-dropdown">
                <div className="dropdown-header">
                  <div className="d-flex align-items-center">
                    <img src="/assets/images/avatar/1.png" alt="user-image" className="img-fluid user-avtar" />
                    <div>
                      <h6 className="text-dark mb-0">{user?.email || 'User'} <span className="badge bg-soft-success text-success ms-1">PRO</span></h6>
                      <span className="fs-12 fw-medium text-muted">{user?.email || 'user@example.com'}</span>
                    </div>
                  </div>
                </div>
                <div className="dropdown">
                  <a href="javascript:void(0);" className="dropdown-item" data-bs-toggle="dropdown">
                    <span className="hstack">
                      <i className="wd-10 ht-10 border border-2 border-gray-1 bg-success rounded-circle me-2"></i>
                      <span>Active</span>
                    </span>
                    <i className="feather-chevron-right ms-auto me-0"></i>
                  </a>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown">
                  <a href="javascript:void(0);" className="dropdown-item" data-bs-toggle="dropdown">
                    <span className="hstack">
                      <i className="feather-dollar-sign me-2"></i>
                      <span>Subscriptions</span>
                    </span>
                    <i className="feather-chevron-right ms-auto me-0"></i>
                  </a>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item">
                  <i className="feather-user"></i>
                  <span>Profile Details</span>
                </Link>
                <a href="javascript:void(0);" className="dropdown-item">
                  <i className="feather-activity"></i>
                  <span>Activity Feed</span>
                </a>
                <a href="javascript:void(0);" className="dropdown-item">
                  <i className="feather-dollar-sign"></i>
                  <span>Billing Details</span>
                </a>
                <a href="javascript:void(0);" className="dropdown-item">
                  <i className="feather-bell"></i>
                  <span>Notifications</span>
                </a>
                <Link to="/settings" className="dropdown-item">
                  <i className="feather-settings"></i>
                  <span>Account Settings</span>
                </Link>
                <div className="dropdown-divider"></div>
                <a href="javascript:void(0);" className="dropdown-item" onClick={handleLogout}>
                  <i className="feather-log-out"></i>
                  <span>Logout</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
