import { Navigate, Outlet } from 'react-router-dom'
import { useRequireAuth } from './useRequireAuth'

/** Redirect unauthenticated users to login. */
export function RequireAuth() {
  const vm = useRequireAuth()
  if (!vm.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
