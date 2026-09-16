import { Navigate } from 'react-router-dom'
import { Popup } from '../Popup'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { useAuthModal, type AuthModalProps } from './useAuthModal'

export type { AuthModalMode } from './useAuthModal'

/** Auth overlay over the marketing page kept via background location. */
export function AuthModal(props: AuthModalProps) {
  const vm = useAuthModal(props)

  if (vm.isAuthenticated) {
    return <Navigate to={vm.redirectTo} replace />
  }

  return (
    <Popup open onClose={vm.close} title={vm.title} size="md">
      {vm.mode === 'login' ? (
        <LoginForm onSuccess={vm.close} />
      ) : (
        <RegisterForm onSuccess={vm.close} />
      )}
    </Popup>
  )
}
