import { useAuth } from '../../auth'

export function useRequireSuperAdmin() {
  const { isAuthenticated, isSuperAdmin } = useAuth()
  return { isAuthenticated, isSuperAdmin }
}
