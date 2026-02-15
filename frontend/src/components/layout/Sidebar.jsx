import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <nav className="nxl-navigation">
      <div className="navbar-wrapper">
        <div className="m-header">
          <Link to="/" className="b-brand">
            <img src="/assets/images/logo/logo-full.png" alt="" className="logo logo-lg" />
            <img src="/assets/images/logo/logo-abbr.png" alt="" className="logo logo-sm" />
          </Link>
        </div>
        <div className="navbar-content">
          <ul className="nxl-navbar">
            <li className="nxl-item nxl-caption">
              <label>Navigation</label>
            </li>
            
            {/* Dashboards */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-airplay"></i></span>
                <span className="nxl-mtext">Dashboards</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/')}`} to="/">CRM</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/analytics">Analytics</Link></li>
              </ul>
            </li>
            
            {/* Reports */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-cast"></i></span>
                <span className="nxl-mtext">Reports</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/reports/sales">Sales Report</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/reports/leads">Leads Report</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/reports/project">Project Report</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/reports/timesheets">Timesheets Report</Link></li>
              </ul>
            </li>
            
            {/* Applications */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-send"></i></span>
                <span className="nxl-mtext">Applications</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/apps/chat">Chat</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/tasks')}`} to="/tasks">Tasks</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/apps/notes">Notes</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/apps/storage">Storage</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/apps/calendar">Calendar</Link></li>
              </ul>
            </li>
            
            {/* Proposal */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-at-sign"></i></span>
                <span className="nxl-mtext">Proposal</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/proposal">Proposal</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/proposal/view">Proposal View</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/proposal/edit">Proposal Edit</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/proposal/create">Proposal Create</Link></li>
              </ul>
            </li>
            
            {/* Payment */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-dollar-sign"></i></span>
                <span className="nxl-mtext">Payment</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/payment">Payment</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/invoice/view">Invoice View</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/invoice/create">Invoice Create</Link></li>
              </ul>
            </li>
            
            {/* Customers */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-users"></i></span>
                <span className="nxl-mtext">Customers</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/customers')}`} to="/customers">Customers</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/customers/view">Customers View</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/customers/create')}`} to="/customers/create">Customers Create</Link></li>
              </ul>
            </li>
            
            {/* Leads */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-alert-circle"></i></span>
                <span className="nxl-mtext">Leads</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/leads')}`} to="/leads">Leads</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/leads/view">Leads View</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/leads/create')}`} to="/leads/create">Leads Create</Link></li>
              </ul>
            </li>
            
            {/* Projects */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-briefcase"></i></span>
                <span className="nxl-mtext">Projects</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/projects')}`} to="/projects">Projects</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/projects/view">Projects View</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/projects/create">Projects Create</Link></li>
              </ul>
            </li>
            
            {/* Widgets */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-layout"></i></span>
                <span className="nxl-mtext">Widgets</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/lists">Lists</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/tables">Tables</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/charts">Charts</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/statistics">Statistics</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/miscellaneous">Miscellaneous</Link></li>
              </ul>
            </li>
            
            {/* Settings */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-settings"></i></span>
                <span className="nxl-mtext">Settings</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/settings')}`} to="/settings">General</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/seo">SEO</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/tags">Tags</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/email">Email</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/tasks">Tasks</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/leads">Leads</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/support">Support</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/finance">Finance</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/gateways">Gateways</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/customers">Customers</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/localization">Localization</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/recaptcha">reCAPTCHA</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/miscellaneous">Miscellaneous</Link></li>
              </ul>
            </li>
            
            {/* Utilisateurs - Admin */}
            <li className="nxl-item">
              <Link to="/users" className={`nxl-link ${isActive('/users')}`}>
                <span className="nxl-micon"><i className="feather-user-check"></i></span>
                <span className="nxl-mtext">Utilisateurs</span>
              </Link>
            </li>
            
            {/* Contacts */}
            <li className="nxl-item">
              <Link to="/contacts" className={`nxl-link ${isActive('/contacts')}`}>
                <span className="nxl-micon"><i className="feather-user-plus"></i></span>
                <span className="nxl-mtext">Contacts</span>
              </Link>
            </li>
            
            {/* Espace perso */}
            <li className="nxl-item nxl-caption">
              <label>Espace perso</label>
            </li>
            
            <li className="nxl-item">
              <Link to="/cv" className={`nxl-link ${isActive('/cv')}`}>
                <span className="nxl-micon"><i className="feather-file-text"></i></span>
                <span className="nxl-mtext">Mon CV</span>
              </Link>
            </li>
            
            {/* Help Center */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-life-buoy"></i></span>
                <span className="nxl-mtext">Help Center</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><a className="nxl-link" href="#">Support</a></li>
                <li className="nxl-item"><Link className="nxl-link" to="/help/knowledgebase">KnowledgeBase</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/docs/documentations">Documentations</Link></li>
              </ul>
            </li>
          </ul>
          
          {/* Download Card */}
          <div className="card text-center">
            <div className="card-body">
              <i className="feather-sunrise fs-4 text-dark"></i>
              <h6 className="mt-4 text-dark fw-bolder">Downloading Center</h6>
              <p className="fs-11 my-3 text-dark">MACCAM is a production ready CRM to get started up and running easily.</p>
              <a href="https://www.maccam.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary text-dark w-100">En savoir plus</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
