import { useTranslation } from 'react-i18next'
import {
  useLocation,
  useNavigate,
  type Location,
} from 'react-router-dom'
import { useAuth } from '../../../auth'

export type AuthModalMode = 'login' | 'register'

export type AuthModalProps = {
  mode: AuthModalMode
}

type LocationState = {
  background?: Location
  from?: string
}

/** Auth modal close/redirect — success goes to app dashboard. */
export function useAuthModal({ mode }: AuthModalProps) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const background = state?.background
  const from = state?.from

  function close() {
    if (background) {
      navigate(background, { replace: true })
      return
    }
    navigate('/', { replace: true })
  }

  function onAuthSuccess() {
    navigate(from && from !== '/login' && from !== '/register' ? from : '/dashboard', {
      replace: true,
    })
  }

  const title = mode === 'login' ? t('login.title') : t('register.title')
  const successPath =
    from && from !== '/login' && from !== '/register' ? from : '/dashboard'

  return {
    mode,
    t,
    isAuthenticated,
    background,
    close,
    onAuthSuccess,
    title,
    successPath,
  }
}
