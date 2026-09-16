import { useLocation } from 'react-router-dom'
import { useAuth } from '../../auth'

type AuthRedirectState = {
  background: { pathname: string; search: string; hash: string; state: null }
  from: string
}

/** UX-only guard — backend permissions remain authoritative. */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const redirectState: AuthRedirectState = {
    background: { pathname: '/', search: '', hash: '', state: null },
    from: `${location.pathname}${location.search}`,
  }

  return { isAuthenticated, redirectState }
}
