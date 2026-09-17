import { useCallback, useEffect, useState } from 'react'
import {
  cancelInvitation,
  listInvitations,
  type AdminInvitation,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { AdminListFilters } from '../../components/AdminListFilters'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { useAdminListParams } from '../../hooks/useAdminListParams'

export function useInvitations() {
  const { access } = useAuth()
  const listParams = useAdminListParams({ status: 'PENDING' })
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
      setItems(
        await listInvitations(access, {
          status: listParams.filters.status,
          search: listParams.filters.search,
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [access, listParams.filters.search, listParams.filters.status])

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

  const filtersUi = (
    <AdminListFilters
      searchInput={listParams.searchInput}
      onSearchChange={listParams.setSearchInput}
      searchPlaceholder={copy.searchInvitations}
      selects={[
        {
          id: 'invite-status',
          label: copy.status,
          value: listParams.status,
          onChange: listParams.setStatus,
          options: [
            { value: '', label: copy.filterAll },
            { value: 'PENDING', label: copy.filterPending },
            { value: 'ACCEPTED', label: 'Accepted' },
            { value: 'DECLINED', label: 'Declined' },
            { value: 'EXPIRED', label: 'Expired' },
          ],
        },
      ]}
    />
  )

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
    filtersUi,
  }
}
