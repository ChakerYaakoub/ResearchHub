import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

export function useProjectDetails() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  return { t, id }
}
