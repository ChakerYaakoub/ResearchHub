import { Navigate, Outlet } from 'react-router-dom'
import { requestLoginModal } from '../AuthUi'
import { useRequireAuth } from './useRequireAuth'

/** Redirect unauthenticated users to public home and request login modal. */
export function RequireAuth() {
  const vm = useRequireAuth()

  if (!vm.isAuthenticated) {
    requestLoginModal()
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
