import { Navigate, Outlet } from 'react-router-dom'
import { useRequireSuperAdmin } from './useRequireSuperAdmin'

/**
 * UX-only SUPER_ADMIN gate for `/admins`.
 * Non–super-admins redirect home; API still enforces create-admin AuthZ.
 */
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
