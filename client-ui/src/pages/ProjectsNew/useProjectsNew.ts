import { useTranslation } from 'react-i18next'

export function useProjectsNew() {
  const { t } = useTranslation()
  return { t }
}
