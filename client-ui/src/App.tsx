/**
 * Client app: marketing + auth modals + researcher dashboard (Phase 10).
 * Tokens stay on this origin only.
 * Auth uses background-location so marketing pages stay under the popup.
 */
import { Route, Routes, useLocation, type Location } from 'react-router-dom'
import { AuthProvider } from './auth'
import { AuthModal } from './components/auth'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { DashboardPage } from './pages/Dashboard'
import { DocumentationPage } from './pages/Documentation'
import { FacilitiesPage } from './pages/Facilities'
import { HomePage } from './pages/Home'
import { HowItWorksPage } from './pages/HowItWorks'
import { InstrumentsPage } from './pages/Instruments'
import { InvitationsPage } from './pages/Invitations'
import { ProjectDetailsPage } from './pages/ProjectDetails'
import { ProjectsPage } from './pages/Projects'
import { ProjectsNewPage } from './pages/ProjectsNew'
import './App.css'

type LocationState = { background?: Location }

function AppRoutes() {
  const location = useLocation()
  const state = location.state as LocationState | null
  const background = state?.background
  const isAuthPath =
    location.pathname === '/login' || location.pathname === '/register'
  /** Direct /login|/register visits render Home underneath the modal. */
  const mainLocation =
    background ??
    (isAuthPath ? ({ ...location, pathname: '/' } as Location) : location)

  return (
    <>
      <Routes location={mainLocation}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/instruments" element={<InstrumentsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<ProjectsNewPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/invitations" element={<InvitationsPage />} />
          </Route>
        </Route>
      </Routes>

      {isAuthPath ? (
        <Routes>
          <Route path="/login" element={<AuthModal mode="login" />} />
          <Route path="/register" element={<AuthModal mode="register" />} />
        </Routes>
      ) : null}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
