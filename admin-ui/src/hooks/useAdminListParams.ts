import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Sync list filters to the URL; debounce search input for typing. */
export function useAdminListParams(defaults?: { status?: string }) {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const status = params.has('status')
    ? (params.get('status') ?? '')
    : (defaults?.status ?? '')
  const kind = params.get('kind') ?? ''
  const isActive = params.get('is_active') ?? ''
  const installation = params.get('installation') ?? ''

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === search) return
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next) p.set('search', next)
          else p.delete('search')
          return p
        },
        { replace: true },
      )
    }, 300)
    return () => window.clearTimeout(handle)
  }, [searchInput, search, setParams])

  const setParam = useCallback(
    (key: string, value: string, keepEmpty = false) => {
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (value || keepEmpty) p.set(key, value)
          else p.delete(key)
          return p
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status || undefined,
      kind: kind || undefined,
      is_active: isActive || undefined,
      installation: installation || undefined,
    }),
    [search, status, kind, isActive, installation],
  )

  return {
    searchInput,
    setSearchInput,
    status,
    setStatus: (v: string) => setParam('status', v, Boolean(defaults?.status)),
    kind,
    setKind: (v: string) => setParam('kind', v),
    isActive,
    setIsActive: (v: string) => setParam('is_active', v),
    installation,
    setInstallation: (v: string) => setParam('installation', v),
    filters,
  }
}
