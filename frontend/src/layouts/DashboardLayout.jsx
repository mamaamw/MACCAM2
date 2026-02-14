import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function DashboardLayout({ children }) {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="nxl-container">
        <div className="nxl-content">
          <div className="main-content">
            {children || <Outlet />}
          </div>
          <footer className="footer">
            <p className="fs-11 text-muted fw-medium text-uppercase mb-0 copyright">
              <span>Copyright ©</span> 2026 MACCAM CRM
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
