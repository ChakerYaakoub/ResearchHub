import { useAuth } from '../../auth'

export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  return { isAuthenticated }
}
