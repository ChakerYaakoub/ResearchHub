import { Navigate, Outlet } from 'react-router-dom'
import { useRequireAuth } from './useRequireAuth'

/**
 * UX-only route gate: unauthenticated → `/login`.
 * Does not enforce platform roles beyond AuthContext — backend AuthZ is authoritative.
 */
export function RequireAuth() {
  const vm = useRequireAuth()
  if (!vm.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
