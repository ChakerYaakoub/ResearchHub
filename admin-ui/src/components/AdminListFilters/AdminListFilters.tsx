import type { ReactNode } from 'react'

type Option = { value: string; label: string }

/** Search + select filters for admin list pages (wired to useAdminListParams). */
type AdminListFiltersProps = {
  searchInput: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  selects?: Array<{
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    options: Option[]
  }>
  extra?: ReactNode
}

/** Compact Bootstrap filter row for admin list pages. */
export function AdminListFilters({
  searchInput,
  onSearchChange,
  searchPlaceholder,
  selects = [],
  extra,
}: AdminListFiltersProps) {
  return (
    <div className="row g-2 align-items-end mb-3">
      <div className="col-12 col-md">
        <label className="form-label small mb-1" htmlFor="admin-list-search">
          Search
        </label>
        <input
          id="admin-list-search"
          type="search"
          className="form-control form-control-sm"
          value={searchInput}
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {selects.map((s) => (
        <div className="col-6 col-md-auto" key={s.id}>
          <label className="form-label small mb-1" htmlFor={s.id}>
            {s.label}
          </label>
          <select
            id={s.id}
            className="form-select form-select-sm"
            value={s.value}
            onChange={(e) => s.onChange(e.target.value)}
          >
            {s.options.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {extra ? <div className="col-12 col-md-auto">{extra}</div> : null}
    </div>
  )
}
