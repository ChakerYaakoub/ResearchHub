import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

export type HomeStep = { title: string; body: string }

/** Home marketing copy + auth CTA background location. */
export function useHome() {
  const { t } = useTranslation()
  const location = useLocation()
  const steps = t('home.steps', { returnObjects: true }) as HomeStep[]

  return {
    t,
    location,
    steps: Array.isArray(steps) ? steps : [],
  }
}
