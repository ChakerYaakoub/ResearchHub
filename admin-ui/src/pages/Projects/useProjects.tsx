import { useCallback, useEffect, useState } from 'react'
import { listProjects, type AdminProject } from '../../api/admin'
import { ApiError } from '../../api/client'
import { AdminListFilters } from '../../components/AdminListFilters'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { useAdminListParams } from '../../hooks/useAdminListParams'

const PROJECT_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'RESUBMITTED',
  'IN_PROGRESS',
  'COMPLETED',
  'SOFT_DELETED',
]

export function useProjects() {
  const { access } = useAuth()
  const listParams = useAdminListParams()
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setProjects(
        await listProjects(access, {
          status: listParams.filters.status,
          search: listParams.filters.search,
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [access, listParams.filters.search, listParams.filters.status])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtersUi =
    !loading && (projects.length > 0 || listParams.hasActiveFilters) ? (
    <AdminListFilters
      searchInput={listParams.searchInput}
      onSearchChange={listParams.setSearchInput}
      searchPlaceholder={copy.searchProjects}
      selects={[
        {
          id: 'project-status',
          label: copy.status,
          value: listParams.status,
          onChange: listParams.setStatus,
          options: [
            { value: '', label: copy.filterAll },
            ...PROJECT_STATUSES.map((s) => ({ value: s, label: s })),
          ],
        },
      ]}
    />
  ) : null

  return { copy, projects, loading, error, filtersUi }
}
