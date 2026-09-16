import { useCallback, useEffect, useState } from 'react'
import { listProjects, type AdminProject } from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export function useProjects() {
  const { access } = useAuth()
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setProjects(await listProjects(access))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [access])

  useEffect(() => {
    void reload()
  }, [reload])

  return { copy, projects, loading, error }
}
