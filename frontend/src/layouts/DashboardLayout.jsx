import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const isAppLikePage = location.pathname === '/apps/chat' || location.pathname === '/tasks'

  return (
    <>
      <Sidebar />
      <Header />
      <main className="nxl-container">
        <div className="nxl-content">
          <div className={`main-content ${isAppLikePage ? 'p-0' : ''}`}>
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </>
  )
}
