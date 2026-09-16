import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth'
import { useAuthUi } from '../../components/AuthUi'

export type HomeStep = { title: string; body: string }

/** Home marketing copy + auth CTA handlers. */
export function useHome() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { openRegister } = useAuthUi()
  const steps = t('home.steps', { returnObjects: true }) as HomeStep[]

  return {
    t,
    isAuthenticated,
    openRegister,
    steps: Array.isArray(steps) ? steps : [],
  }
}
