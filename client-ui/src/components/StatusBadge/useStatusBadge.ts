export type StatusBadgeProps = {
  status: string
  label: string
}

const KNOWN = new Set([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'RESUBMITTED',
  'IN_PROGRESS',
  'COMPLETED',
  'SOFT_DELETED',
  'PENDING',
  'PLANNED',
  'SCHEDULED',
  'CANCELLED',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
  'ADMIN',
  'SUPER_ADMIN',
  'RESEARCHER',
])

/**
 * Maps status strings to CSS tone classes (`rh-status-badge--draft`, etc.).
 * Unknown statuses fall back to `--unknown`; label text comes from the caller (i18n).
 */
export function useStatusBadge(props: StatusBadgeProps) {
  const key = props.status.toUpperCase()
  const toneKey = KNOWN.has(key) ? key.toLowerCase() : 'unknown'
  return {
    label: props.label,
    className: `badge rh-status-badge rh-status-badge--${toneKey}`,
  }
}
