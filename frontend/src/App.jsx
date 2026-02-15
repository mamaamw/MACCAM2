import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { useI18n } from './i18n/I18nContext'
import useDomTranslator from './i18n/useDomTranslator'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import cleanBackdrop from './utils/cleanBackdrop'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import CV from './pages/CV'
import EditExperiences from './pages/cv/EditExperiences'
import EditEducation from './pages/cv/EditEducation'
import EditSkills from './pages/cv/EditSkills'
import Customers from './pages/customers/Customers'
import CustomerView from './pages/customers/CustomerView'
import CustomerCreate from './pages/customers/CustomerCreate'
import Leads from './pages/leads/Leads'
import LeadView from './pages/leads/LeadView'
import LeadCreate from './pages/leads/LeadCreate'
import Projects from './pages/projects/Projects'
import ProjectView from './pages/projects/ProjectView'
import ProjectCreate from './pages/projects/ProjectCreate'
import Tasks from './pages/tasks/Tasks'
import Invoices from './pages/invoices/Invoices'
import InvoiceView from './pages/invoice/InvoiceView'
import InvoiceCreate from './pages/invoice/InvoiceCreate'
import Settings from './pages/Settings'
import Users from './pages/Users'
import Contacts from './pages/Contacts'
import ContactDetail from './pages/ContactDetail'

// Apps
import Chat from './pages/apps/Chat'
import Notes from './pages/apps/Notes'
import Storage from './pages/apps/Storage'
import Calendar from './pages/apps/Calendar'

// Analytics & Reports
import Analytics from './pages/Analytics'
import SalesReport from './pages/reports/SalesReport'
import LeadsReport from './pages/reports/LeadsReport'
import ProjectReport from './pages/reports/ProjectReport'
import TimesheetsReport from './pages/reports/TimesheetsReport'

// Proposals & Payments
import Proposal from './pages/proposal/Proposal'
import ProposalView from './pages/proposal/ProposalView'
import ProposalCreate from './pages/proposal/ProposalCreate'
import ProposalEdit from './pages/proposal/ProposalEdit'
import Payment from './pages/payment/Payment'

// Widgets
import WidgetsLists from './pages/widgets/Lists'
import WidgetsTables from './pages/widgets/Tables'
import WidgetsCharts from './pages/widgets/Charts'
import WidgetsStatistics from './pages/widgets/Statistics'
import WidgetsMiscellaneous from './pages/widgets/Miscellaneous'

// Settings
import SettingsSEO from './pages/settings/SEO'
import SettingsTags from './pages/settings/Tags'
import SettingsEmail from './pages/settings/Email'

// Help & Docs
import HelpKnowledgebase from './pages/help/Knowledgebase'
import Documentations from './pages/docs/Documentations'

function App() {
  const { token } = useAuthStore()
  const location = useLocation()
  const { language } = useI18n()

  useDomTranslator(language)

  useEffect(() => {
    // Nettoyer les backdrops de modals Bootstrap à chaque changement de route
    cleanBackdrop();
  }, [location, token])

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
      
      <Route path="/projects/create" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProjectCreate />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/projects/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProjectView />
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
      
      <Route path="/invoice/view/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <InvoiceView />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoice/create" element={
        <ProtectedRoute>
          <DashboardLayout>
            <InvoiceCreate />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Proposals */}
      <Route path="/proposal" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Proposal />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/proposal/view/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProposalView />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/proposal/create" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProposalCreate />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/proposal/edit/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProposalEdit />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Payments */}
      <Route path="/payment" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Payment />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Analytics */}
      <Route path="/analytics" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Reports */}
      <Route path="/reports/sales" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SalesReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports/leads" element={
        <ProtectedRoute>
          <DashboardLayout>
            <LeadsReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports/project" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProjectReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports/timesheets" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TimesheetsReport />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Apps */}
      <Route path="/apps/chat" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Chat />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/apps/notes" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Notes />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/apps/storage" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Storage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/apps/calendar" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Calendar />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Widgets */}
      <Route path="/widgets/lists" element={
        <ProtectedRoute>
          <DashboardLayout>
            <WidgetsLists />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/widgets/tables" element={
        <ProtectedRoute>
          <DashboardLayout>
            <WidgetsTables />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/widgets/charts" element={
        <ProtectedRoute>
          <DashboardLayout>
            <WidgetsCharts />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/widgets/statistics" element={
        <ProtectedRoute>
          <DashboardLayout>
            <WidgetsStatistics />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/widgets/miscellaneous" element={
        <ProtectedRoute>
          <DashboardLayout>
            <WidgetsMiscellaneous />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Settings Sub-pages */}
      <Route path="/settings/seo" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SettingsSEO />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings/tags" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SettingsTags />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings/email" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SettingsEmail />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Help */}
      <Route path="/help/knowledgebase" element={
        <ProtectedRoute>
          <DashboardLayout>
            <HelpKnowledgebase />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/docs/documentations" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Documentations />
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
      
      {/* CV */}
      <Route path="/cv" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CV />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/cv/edit-experiences" element={
        <ProtectedRoute>
          <DashboardLayout>
            <EditExperiences />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/cv/edit-education" element={
        <ProtectedRoute>
          <DashboardLayout>
            <EditEducation />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/cv/edit-skills" element={
        <ProtectedRoute>
          <DashboardLayout>
            <EditSkills />
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
