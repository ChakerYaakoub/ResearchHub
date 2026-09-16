import { useTranslation } from 'react-i18next'

export function useDashboard() {
  const { t } = useTranslation()
  return { t }
}
