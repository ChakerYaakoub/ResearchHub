import { Popup } from '../../Popup'
import { ForgotPasswordForm } from '../ForgotPasswordForm'
import { LoginForm } from '../LoginForm'
import { RegisterForm } from '../RegisterForm'
import { ResetPasswordForm } from '../ResetPasswordForm'
import { useAuthModal, type AuthModalProps } from './useAuthModal'

export type { AuthModalMode } from './useAuthModal'

/** Auth overlay opened by buttons via AuthUi context. */
export function AuthModal(props: AuthModalProps) {
  const vm = useAuthModal(props)

  return (
    <Popup open={vm.open} onClose={vm.onClose} title={vm.title} size="md">
      {vm.mode === 'login' ? (
        <LoginForm
          onSuccess={vm.onSuccess}
          onSwitchToRegister={() => vm.onSwitchMode('register')}
          onSwitchToForgot={() => vm.onSwitchMode('forgot')}
        />
      ) : null}
      {vm.mode === 'register' ? (
        <RegisterForm
          onSuccess={vm.onSuccess}
          onSwitchToLogin={() => vm.onSwitchMode('login')}
        />
      ) : null}
      {vm.mode === 'forgot' ? (
        <ForgotPasswordForm
          onSwitchToLogin={() => vm.onSwitchMode('login')}
        />
      ) : null}
      {vm.mode === 'reset' ? (
        <ResetPasswordForm
          onSuccess={() => vm.onSwitchMode('login')}
          onSwitchToLogin={() => vm.onSwitchMode('login')}
        />
      ) : null}
    </Popup>
  )
}
