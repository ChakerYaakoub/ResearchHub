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

export function useStatusBadge(props: StatusBadgeProps) {
  const key = props.status.toUpperCase()
  const toneKey = KNOWN.has(key) ? key.toLowerCase() : 'unknown'
  return {
    label: props.label,
    className: `badge rh-status-badge rh-status-badge--${toneKey}`,
  }
}
