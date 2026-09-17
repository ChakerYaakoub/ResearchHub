import { Navigate, Outlet } from 'react-router-dom'
import { requestLoginModal } from '../AuthUi'
import { useRequireAuth } from './useRequireAuth'

/**
 * UX-only route gate: if no JWT session, flag login modal and Navigate to `/`.
 * Does not enforce project roles — backend AuthZ remains authoritative.
 */
export function RequireAuth() {
  const vm = useRequireAuth()

  if (!vm.isAuthenticated) {
    requestLoginModal()
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
