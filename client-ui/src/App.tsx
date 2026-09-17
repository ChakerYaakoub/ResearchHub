/**
 * Client app: public marketing + separate dashboard shell (Phase 10).
 * Tokens stay on this origin only.
 * Auth uses button-opened modal (no /login|/register routes).
 */
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import { AuthModalHost, AuthUiProvider } from './components/AuthUi'
import { DashboardLayout } from './components/DashboardLayout'
import { InviteDeepLink } from './components/InviteDeepLink'
import { PublicLayout } from './components/PublicLayout'
import { RequireAuth } from './components/RequireAuth'
import { DashboardPage } from './pages/Dashboard'
import { DocumentationPage } from './pages/Documentation'
import { HomePage } from './pages/Home'
import { HowItWorksPage } from './pages/HowItWorks'
import { InvitationsPage } from './pages/Invitations'
import { ProjectDetailsPage } from './pages/ProjectDetails'
import { ProjectsPage } from './pages/Projects'
import { ProjectsNewPage } from './pages/ProjectsNew'
import './App.css'

function AppRoutes() {
  return (
    <>
      <InviteDeepLink />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<ProjectsNewPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/invitations" element={<InvitationsPage />} />
          </Route>
        </Route>
      </Routes>
      <AuthModalHost />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthUiProvider>
        <AppRoutes />
      </AuthUiProvider>
    </AuthProvider>
  )
}

export default App
