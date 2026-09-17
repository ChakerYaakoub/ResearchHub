import { useTranslation } from 'react-i18next'
import type { AuthModalMode } from '../../AuthUi/AuthUiContext'

export type AuthModalProps = {
  open: boolean
  mode: AuthModalMode
  onClose: () => void
  onSuccess: () => void
  onSwitchMode: (mode: AuthModalMode) => void
}

/** Auth popup controlled by AuthUi context (no routes). */
export function useAuthModal({
  open,
  mode,
  onClose,
  onSuccess,
  onSwitchMode,
}: AuthModalProps) {
  const { t } = useTranslation()
  const title =
    mode === 'login'
      ? t('login.title')
      : mode === 'register'
        ? t('register.title')
        : mode === 'forgot'
          ? t('forgot.title')
          : t('reset.title')

  return {
    open,
    mode,
    onClose,
    onSuccess,
    onSwitchMode,
    title,
    t,
  }
}

export type { AuthModalMode }
