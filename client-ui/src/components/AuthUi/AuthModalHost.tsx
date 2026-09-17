import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { getInviteToken } from '../../auth/inviteTokenStorage'
import { AuthModal } from '../auth'
import { consumeLoginModalRequest, useAuthUi } from './AuthUiContext'

function postAuthPath(): string {
  return getInviteToken() ? '/invitations' : '/dashboard'
}

/** Renders AuthModal from context; consumes RequireAuth login flag. */
export function useAuthModalHost() {
  const { open, mode, close, openLogin, switchMode } = useAuthUi()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (consumeLoginModalRequest()) {
      openLogin()
    }
  }, [openLogin])

  useEffect(() => {
    // Keep forgot/reset open even if a session exists (email deep link).
    if (isAuthenticated && open && mode !== 'reset' && mode !== 'forgot') {
      close()
      navigate(postAuthPath(), { replace: true })
    }
  }, [isAuthenticated, open, mode, close, navigate])

  function onAuthSuccess() {
    close()
    navigate(postAuthPath(), { replace: true })
  }

  return {
    open,
    mode,
    close,
    switchMode,
    onAuthSuccess,
    isAuthenticated,
  }
}

export function AuthModalHost() {
  const vm = useAuthModalHost()

  if (
    vm.isAuthenticated &&
    vm.mode !== 'reset' &&
    vm.mode !== 'forgot'
  ) {
    return null
  }

  return (
    <AuthModal
      open={vm.open}
      mode={vm.mode}
      onClose={vm.close}
      onSuccess={vm.onAuthSuccess}
      onSwitchMode={vm.switchMode}
    />
  )
}
