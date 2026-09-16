import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { listProjects } from '../../api/projects'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import type { Project } from '../../types/api'

/** Load visible projects for the authenticated user. */
export function useProjects() {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!access) return
    let cancelled = false
    setLoading(true)
    setError(null)
    void listProjects(access)
      .then((data) => {
        if (!cancelled) setProjects(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t('errors.loadFailed'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [access, t])

  return { t, projects, loading, error }
}
