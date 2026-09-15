import { useTranslation } from 'react-i18next'
import {
  Navigate,
  useLocation,
  useNavigate,
  type Location,
} from 'react-router-dom'
import { useAuth } from '../../auth'
import { Popup } from '../Popup'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export type AuthModalMode = 'login' | 'register'

type AuthModalProps = {
  mode: AuthModalMode
}

type LocationState = { background?: Location }

/** Auth overlay over the marketing page kept via background location. */
export function AuthModal({ mode }: AuthModalProps) {
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

  if (isAuthenticated) {
    return <Navigate to={background ?? '/'} replace />
  }

  return (
    <Popup
      open
      onClose={close}
      title={mode === 'login' ? t('login.title') : t('register.title')}
      size="md"
    >
      {mode === 'login' ? (
        <LoginForm onSuccess={close} />
      ) : (
        <RegisterForm onSuccess={close} />
      )}
    </Popup>
  )
}
