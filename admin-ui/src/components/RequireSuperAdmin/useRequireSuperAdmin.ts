import { useAuth } from '../../auth'

/** Session + isSuperAdmin for RequireSuperAdmin (UX only). */
export function useRequireSuperAdmin() {
  const { isAuthenticated, isSuperAdmin } = useAuth()
  return { isAuthenticated, isSuperAdmin }
}
