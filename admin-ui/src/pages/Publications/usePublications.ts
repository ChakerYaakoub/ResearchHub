import { useCallback, useEffect, useState } from 'react'
import { listPublications, type AdminPublication } from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export function usePublications() {
  const { access } = useAuth()
  const [items, setItems] = useState<AdminPublication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setItems(await listPublications(access))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [access])

  useEffect(() => {
    void reload()
  }, [reload])

  return { copy, items, loading, error }
}
