/**
 * Admin UI — platform admin panel (PROJECT_SPEC Admin area).
 * Admin API routes require this Origin (ADMIN_UI_ORIGINS).
 */
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { RequireAuth } from './components/RequireAuth'
import { DashboardPage } from './pages/Dashboard'
import { ExperimentsPage } from './pages/Experiments'
import { InvitationsPage } from './pages/Invitations'
import { LoginPage } from './pages/Login'
import { ProjectDetailPage } from './pages/ProjectDetail'
import { ProjectsPage } from './pages/Projects'
import { ProposalsPage } from './pages/Proposals'
import { PublicationsPage } from './pages/Publications'
import { UsersPage } from './pages/Users'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/proposals" element={<ProposalsPage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/invitations" element={<InvitationsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
