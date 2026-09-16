/**
 * Admin UI — platform admin dashboard (Phase 12).
 * Admin API routes require this Origin (ADMIN_UI_ORIGINS).
 */
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'
import { RequireAuth } from './components/RequireAuth'
import { DashboardPage } from './pages/Dashboard'
import { LoginPage } from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
