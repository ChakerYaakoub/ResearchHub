import { useTranslation } from 'react-i18next'
import {
  useLocation,
  useNavigate,
  type Location,
} from 'react-router-dom'
import { useAuth } from '../../auth'

export type AuthModalMode = 'login' | 'register'

export type AuthModalProps = {
  mode: AuthModalMode
}

type LocationState = { background?: Location }

/** Auth modal close/redirect logic over background location. */
export function useAuthModal({ mode }: AuthModalProps) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const background = (location.state as LocationState | null)?.background

  function close() {
    if (background) {
      navigate(background, { replace: true })
      return
    }
    navigate('/', { replace: true })
  }

  const title = mode === 'login' ? t('login.title') : t('register.title')
  const redirectTo = background ?? '/'

  return {
    mode,
    t,
    isAuthenticated,
    background,
    close,
    title,
    redirectTo,
  }
}
