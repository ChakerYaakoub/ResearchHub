import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { setInviteToken } from '../../auth/inviteTokenStorage'
import { setResetCredentials } from '../../auth/resetTokenStorage'
import { useAuthUi } from '../AuthUi'

/**
 * Email deep links:
 * - ?auth=login|register&token=… → invite session + auth modal
 * - ?auth=reset&uid=…&token=… → reset session + reset modal
 */
export function useInviteDeepLink() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openLogin, openRegister, openReset } = useAuthUi()

  useEffect(() => {
    const auth = searchParams.get('auth')
    const token = searchParams.get('token')
    const uid = searchParams.get('uid')
    if (!auth && !token && !uid) return

    if (auth === 'reset' && uid && token) {
      setResetCredentials(uid, token)
      navigate({ pathname: '/', search: '' }, { replace: true })
      openReset()
      return
    }

    if (token && auth !== 'reset') {
      setInviteToken(token)
    }

    navigate({ pathname: '/', search: '' }, { replace: true })

    if (!isAuthenticated) {
      if (auth === 'login') openLogin()
      else if (auth === 'register') openRegister()
      return
    }

    if (token && auth !== 'reset') {
      navigate('/invitations', { replace: true })
    }
  }, [
    searchParams,
    isAuthenticated,
    navigate,
    openLogin,
    openRegister,
    openReset,
  ])
}
