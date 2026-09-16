import { useAuth } from '../../auth'

/** UX-only guard — backend permissions remain authoritative. */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  return { isAuthenticated }
}
