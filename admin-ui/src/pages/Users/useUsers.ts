import { useCallback, useEffect, useState } from 'react'
import {
  listUsers,
  patchUser,
  type AdminUser,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export function useUsers() {
  const { access, user: me } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setUsers(await listUsers(access))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [access])

  useEffect(() => {
    void reload()
  }, [reload])

  async function setRole(id: number, role: 'ADMIN' | 'RESEARCHER') {
    if (!access) return
    setBusyId(id)
    setActionError(null)
    try {
      const updated = await patchUser(access, id, { role })
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setBusyId(null)
    }
  }

  async function setActive(id: number, is_active: boolean) {
    if (!access) return
    setBusyId(id)
    setActionError(null)
    try {
      const updated = await patchUser(access, id, { is_active })
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setBusyId(null)
    }
  }

  return {
    copy,
    users,
    loading,
    error,
    actionError,
    busyId,
    meId: me?.id ?? null,
    setRole,
    setActive,
  }
}
