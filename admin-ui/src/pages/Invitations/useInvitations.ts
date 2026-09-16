import { useCallback, useEffect, useState } from 'react'
import {
  cancelInvitation,
  listInvitations,
  type AdminInvitation,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export function useInvitations() {
  const { access } = useAuth()
  const [items, setItems] = useState<AdminInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pending, setPending] = useState<AdminInvitation | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setItems(await listInvitations(access))
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

  async function confirmCancel() {
    if (!access || !pending) return
    setBusy(true)
    setActionError(null)
    try {
      await cancelInvitation(access, pending.id)
      setPending(null)
      await reload()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setBusy(false)
    }
  }

  return {
    copy,
    items,
    loading,
    error,
    actionError,
    pending,
    setPending,
    busy,
    confirmCancel,
  }
}
