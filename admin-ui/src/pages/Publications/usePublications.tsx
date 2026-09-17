import { useCallback, useEffect, useState } from 'react'
import { listPublications, type AdminPublication } from '../../api/admin'
import { ApiError } from '../../api/client'
import { AdminListFilters } from '../../components/AdminListFilters'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { useAdminListParams } from '../../hooks/useAdminListParams'

export function usePublications() {
  const { access } = useAuth()
  const listParams = useAdminListParams()
  const [items, setItems] = useState<AdminPublication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminPublication | null>(null)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setItems(
        await listPublications(access, {
          search: listParams.filters.search,
          kind: listParams.filters.kind,
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [access, listParams.filters.search, listParams.filters.kind])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtersUi =
    !loading && (items.length > 0 || listParams.hasActiveFilters) ? (
    <AdminListFilters
      searchInput={listParams.searchInput}
      onSearchChange={listParams.setSearchInput}
      searchPlaceholder={copy.searchPublications}
      selects={[
        {
          id: 'pub-kind',
          label: copy.kind,
          value: listParams.kind,
          onChange: listParams.setKind,
          options: [
            { value: '', label: copy.filterAll },
            { value: 'EXISTING', label: copy.kindExisting },
            { value: 'RESULTING', label: copy.kindResulting },
          ],
        },
      ]}
    />
  ) : null

  function openDetail(pub: AdminPublication) {
    setSelected(pub)
  }

  function closeDetail() {
    setSelected(null)
  }

  return {
    copy,
    items,
    loading,
    error,
    filtersUi,
    selected,
    openDetail,
    closeDetail,
  }
}
