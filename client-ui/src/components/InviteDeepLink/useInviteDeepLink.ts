import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { setInviteToken } from '../../auth/inviteTokenStorage'
import { useAuthUi } from '../AuthUi'

/**
 * Email deep link: ?auth=login|register&token=… → sessionStorage + auth modal
 * (or /invitations if already signed in), then strip query.
 */
export function useInviteDeepLink() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openLogin, openRegister } = useAuthUi()

  useEffect(() => {
    const auth = searchParams.get('auth')
    const token = searchParams.get('token')
    if (!auth && !token) return

    if (token) {
      setInviteToken(token)
    }

    navigate({ pathname: '/', search: '' }, { replace: true })

    if (!isAuthenticated) {
      if (auth === 'login') openLogin()
      else if (auth === 'register') openRegister()
      return
    }

    if (token) {
      navigate('/invitations', { replace: true })
    }
  }, [
    searchParams,
    isAuthenticated,
    navigate,
    openLogin,
    openRegister,
  ])
}
