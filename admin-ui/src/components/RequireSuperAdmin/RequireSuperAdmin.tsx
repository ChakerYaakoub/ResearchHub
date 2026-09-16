import { Navigate, Outlet } from 'react-router-dom'
import { useRequireSuperAdmin } from './useRequireSuperAdmin'

/** SUPER_ADMIN only; others redirect to dashboard. */
export function RequireSuperAdmin() {
  const vm = useRequireSuperAdmin()
  if (!vm.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!vm.isSuperAdmin) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
