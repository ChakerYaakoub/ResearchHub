import { useTranslation } from 'react-i18next'

export function useInvitations() {
  const { t } = useTranslation()
  return { t }
}
