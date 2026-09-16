export type StatusBadgeProps = {
  status: string
  /** Optional display label (defaults to status). */
  label?: string
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

export function useStatusBadge({ status, label }: StatusBadgeProps) {
  const key = status.toUpperCase()
  const toneKey = KNOWN.has(key) ? key.toLowerCase() : 'unknown'
  return {
    label: label ?? status,
    className: `badge rh-status-badge rh-status-badge--${toneKey}`,
  }
}
