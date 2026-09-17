import { useAuth } from '../../auth'

/** JWT session flag for RequireAuth (UX only). */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  return { isAuthenticated }
}
