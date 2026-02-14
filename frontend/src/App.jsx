import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Customers from './pages/customers/Customers'
import CustomerView from './pages/customers/CustomerView'
import CustomerCreate from './pages/customers/CustomerCreate'
import Leads from './pages/leads/Leads'
import LeadView from './pages/leads/LeadView'
import LeadCreate from './pages/leads/LeadCreate'
import Projects from './pages/projects/Projects'
import Tasks from './pages/tasks/Tasks'
import Invoices from './pages/invoices/Invoices'
import Settings from './pages/Settings'
import Users from './pages/Users'
import Contacts from './pages/Contacts'
import ContactDetail from './pages/ContactDetail'
import Chat from './pages/apps/Chat'

function App() {
  const { token } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    console.log('✅ App.jsx chargé!')
    console.log('🔄 Navigation:', {
      path: location.pathname,
      authenticated: !!token
    })
  }, [location, token])

  // Test de rendu minimal
  if (typeof window !== 'undefined') {
    console.log('🌐 Window exists')
    console.log('📍 Current path:', window.location.pathname)
  }

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthLayout>
            <Login />
          </AuthLayout>
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <AuthLayout>
            <Register />
          </AuthLayout>
        </PublicRoute>
      } />

      {/* Routes protégées */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Customers */}
      <Route path="/customers" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Customers />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/customers/create" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CustomerCreate />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/customers/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CustomerView />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Leads */}
      <Route path="/leads" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Leads />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/leads/create" element={
        <ProtectedRoute>
          <DashboardLayout>
            <LeadCreate />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/leads/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <LeadView />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Projects */}
      <Route path="/projects" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Projects />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Tasks */}
      <Route path="/tasks" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Tasks />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Invoices */}
      <Route path="/invoices" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Invoices />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Profile */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Users - Admin */}
      <Route path="/users" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Users />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Contacts */}
      <Route path="/contacts" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Contacts />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/contacts/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ContactDetail />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Chat */}
      <Route path="/apps/chat" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Chat />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Settings */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* 404 - Redirection vers login si non connecté */}
      <Route path="*" element={
        token ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  )
}

export default App
