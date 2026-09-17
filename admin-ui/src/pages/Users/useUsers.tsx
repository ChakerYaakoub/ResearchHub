import { useCallback, useEffect, useState } from 'react'
import { listResearchers, patchUser, type AdminUser } from '../../api/admin'
import { ApiError } from '../../api/client'
import { AdminListFilters } from '../../components/AdminListFilters'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { useAdminListParams } from '../../hooks/useAdminListParams'

export function useUsers() {
  const { access, user: me } = useAuth()
  const listParams = useAdminListParams()
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
      const active =
        listParams.filters.is_active === 'true'
          ? true
          : listParams.filters.is_active === 'false'
            ? false
            : undefined
      setUsers(
        await listResearchers(access, {
          search: listParams.filters.search,
          is_active: active,
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [access, listParams.filters.search, listParams.filters.is_active])

  useEffect(() => {
    void reload()
  }, [reload])

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

  const filtersUi = (
    <AdminListFilters
      searchInput={listParams.searchInput}
      onSearchChange={listParams.setSearchInput}
      searchPlaceholder={copy.searchUsers}
      selects={[
        {
          id: 'user-active',
          label: copy.setActive,
          value: listParams.isActive,
          onChange: listParams.setIsActive,
          options: [
            { value: '', label: copy.filterAll },
            { value: 'true', label: copy.filterActive },
            { value: 'false', label: copy.filterInactive },
          ],
        },
      ]}
    />
  )

  return {
    copy,
    users,
    loading,
    error,
    actionError,
    busyId,
    meId: me?.id ?? null,
    setActive,
    filtersUi,
  }
}
