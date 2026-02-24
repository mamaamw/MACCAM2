import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'

export default function Sidebar() {
  const location = useLocation()
  const { t } = useI18n()
  
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
              <label>{t('sidebar.navigation')}</label>
            </li>
            
            {/* Tableaux de bord */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-airplay"></i></span>
                <span className="nxl-mtext">{t('sidebar.dashboards')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/')}`} to="/">{t('sidebar.crm')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/analytics">{t('sidebar.analytics')}</Link></li>
              </ul>
            </li>
            
            {/* Rapports */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-cast"></i></span>
                <span className="nxl-mtext">{t('sidebar.reports')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/reports/sales">{t('sidebar.salesReport')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/reports/leads">{t('sidebar.leadsReport')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/reports/project">{t('sidebar.projectsReport')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/reports/timesheets">{t('sidebar.timesheetsReport')}</Link></li>
              </ul>
            </li>
            
            {/* Applications */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-send"></i></span>
                <span className="nxl-mtext">{t('sidebar.apps')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/apps/chat">{t('sidebar.chat')}</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/tasks')}`} to="/tasks">{t('sidebar.tasks')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/apps/notes">{t('sidebar.notes')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/apps/storage">{t('sidebar.storage')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/apps/calendar">{t('sidebar.calendar')}</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/apps/qr-code')}`} to="/apps/qr-code">QR Code Generator</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/apps/pdf-tools')}`} to="/apps/pdf-tools">PDF Tools</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/apps/notion')}`} to="/apps/notion">Notion Page</Link></li>
              </ul>
            </li>
            
            {/* Proposal */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-at-sign"></i></span>
                <span className="nxl-mtext">{t('sidebar.proposal')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/proposal">{t('sidebar.proposal')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/proposal/view">{t('sidebar.viewProposal')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/proposal/edit">{t('sidebar.editProposal')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/proposal/create">{t('sidebar.createProposal')}</Link></li>
              </ul>
            </li>
            
            {/* Payment */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-dollar-sign"></i></span>
                <span className="nxl-mtext">{t('sidebar.payment')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/payment">{t('sidebar.payment')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/invoice/view">{t('sidebar.viewInvoice')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/invoice/create">{t('sidebar.createInvoice')}</Link></li>
              </ul>
            </li>
            
            {/* Customers */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-users"></i></span>
                <span className="nxl-mtext">{t('sidebar.customers')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/customers')}`} to="/customers">{t('sidebar.customers')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/customers/view">{t('sidebar.viewCustomers')}</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/customers/create')}`} to="/customers/create">{t('sidebar.createCustomer')}</Link></li>
              </ul>
            </li>
            
            {/* Leads */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-alert-circle"></i></span>
                <span className="nxl-mtext">{t('sidebar.leads')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/leads')}`} to="/leads">{t('sidebar.leads')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/leads/view">{t('sidebar.viewLeads')}</Link></li>
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/leads/create')}`} to="/leads/create">{t('sidebar.createLead')}</Link></li>
              </ul>
            </li>
            
            {/* Projects */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-briefcase"></i></span>
                <span className="nxl-mtext">{t('sidebar.projects')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/projects')}`} to="/projects">{t('sidebar.projects')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/projects/view">{t('sidebar.viewProjects')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/projects/create">{t('sidebar.createProject')}</Link></li>
              </ul>
            </li>
            
            {/* Widgets */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-layout"></i></span>
                <span className="nxl-mtext">{t('sidebar.widgets')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/lists">{t('sidebar.lists')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/tables">{t('sidebar.tables')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/charts">{t('sidebar.charts')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/statistics">{t('sidebar.statistics')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/widgets/miscellaneous">{t('sidebar.miscellaneous')}</Link></li>
              </ul>
            </li>
            
            {/* Settings */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-settings"></i></span>
                <span className="nxl-mtext">{t('sidebar.settings')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><Link className={`nxl-link ${isActive('/settings')}`} to="/settings">{t('sidebar.general')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/seo">{t('sidebar.seo')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/tags">{t('sidebar.tags')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/email">{t('sidebar.email')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/tasks">{t('sidebar.tasks')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/leads">{t('sidebar.leads')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/support">{t('sidebar.support')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/finance">{t('sidebar.finance')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/gateways">{t('sidebar.gateways')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/customers">{t('sidebar.customers')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/localization">{t('sidebar.localization')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/recaptcha">{t('sidebar.recaptcha')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/settings/miscellaneous">{t('sidebar.miscellaneous')}</Link></li>
              </ul>
            </li>
            
            {/* Utilisateurs - Admin */}
            <li className="nxl-item">
              <Link to="/users" className={`nxl-link ${isActive('/users')}`}>
                <span className="nxl-micon"><i className="feather-user-check"></i></span>
                <span className="nxl-mtext">{t('sidebar.users')}</span>
              </Link>
            </li>
            
            {/* Contacts */}
            <li className="nxl-item">
              <Link to="/contacts" className={`nxl-link ${isActive('/contacts')}`}>
                <span className="nxl-micon"><i className="feather-user-plus"></i></span>
                <span className="nxl-mtext">{t('sidebar.contacts')}</span>
              </Link>
            </li>
            
            {/* Espace perso */}
            <li className="nxl-item nxl-caption">
              <label>{t('sidebar.personalSpace')}</label>
            </li>
            
            <li className="nxl-item">
              <Link to="/cv" className={`nxl-link ${isActive('/cv')}`}>
                <span className="nxl-micon"><i className="feather-file-text"></i></span>
                <span className="nxl-mtext">{t('sidebar.myCv')}</span>
              </Link>
            </li>
            
            <li className="nxl-item">
              <Link to="/recipes" className={`nxl-link ${isActive('/recipes')}`}>
                <span className="nxl-micon"><i className="feather-book-open"></i></span>
                <span className="nxl-mtext">Mes Recettes</span>
              </Link>
            </li>
            
            <li className="nxl-item">
              <Link to="/shopping-list" className={`nxl-link ${isActive('/shopping-list')}`}>
                <span className="nxl-micon"><i className="feather-shopping-cart"></i></span>
                <span className="nxl-mtext">Liste de courses</span>
              </Link>
            </li>
            
            <li className="nxl-item">
              <Link to="/meal-planner" className={`nxl-link ${isActive('/meal-planner')}`}>
                <span className="nxl-micon"><i className="feather-calendar"></i></span>
                <span className="nxl-mtext">Planificateur de repas</span>
              </Link>
            </li>
            
            <li className="nxl-item">
              <Link to="/expense-sharing" className={`nxl-link ${isActive('/expense-sharing')}`}>
                <span className="nxl-micon"><i className="feather-dollar-sign"></i></span>
                <span className="nxl-mtext">Partage de dépenses</span>
              </Link>
            </li>
            
            {/* Centre d'aide */}
            <li className="nxl-item nxl-hasmenu">
              <a href="#" onClick={(e) => e.preventDefault()} className="nxl-link">
                <span className="nxl-micon"><i className="feather-life-buoy"></i></span>
                <span className="nxl-mtext">{t('sidebar.helpCenter')}</span>
                <span className="nxl-arrow"><i className="feather-chevron-right"></i></span>
              </a>
              <ul className="nxl-submenu">
                <li className="nxl-item"><a className="nxl-link" href="#">{t('sidebar.support')}</a></li>
                <li className="nxl-item"><Link className="nxl-link" to="/help/knowledgebase">{t('sidebar.knowledgebase')}</Link></li>
                <li className="nxl-item"><Link className="nxl-link" to="/docs/documentations">{t('sidebar.documentation')}</Link></li>
              </ul>
            </li>
          </ul>
          
        </div>
      </div>
    </nav>
  )
}
