import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth'
import { useAuthUi } from '../../components/AuthUi'

export type HomeCard = { title: string; body: string }

/**
 * Public `/` marketing page: i18n cards + openRegister CTA.
 * No API calls; authenticated users still see the page under PublicLayout.
 */
export function useHome() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { openRegister } = useAuthUi()

  const asCards = (key: string): HomeCard[] => {
    const value = t(key, { returnObjects: true })
    return Array.isArray(value) ? (value as HomeCard[]) : []
  }

  return {
    t,
    isAuthenticated,
    openRegister,
    steps: asCards('home.steps'),
    benefits: asCards('home.benefits'),
    phases: asCards('home.phases'),
    capabilities: asCards('home.capabilities'),
  }
}
