import { useTranslation } from 'react-i18next'

export function useProjects() {
  const { t } = useTranslation()
  return { t }
}
