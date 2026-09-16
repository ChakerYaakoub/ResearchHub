import { Navigate, Outlet } from 'react-router-dom'
import { useRequireAuth } from './useRequireAuth'

/** Redirect unauthenticated users to the login modal. */
export function RequireAuth() {
  const vm = useRequireAuth()

  if (!vm.isAuthenticated) {
    return <Navigate to="/login" replace state={vm.redirectState} />
  }

  return <Outlet />
}
