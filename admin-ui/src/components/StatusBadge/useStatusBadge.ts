export type StatusBadgeProps = {
  status: string
}

const TONE: Record<string, string> = {
  DRAFT: 'secondary',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  PENDING: 'warning',
  PLANNED: 'secondary',
  SCHEDULED: 'info',
  CANCELLED: 'secondary',
  ACCEPTED: 'success',
  DECLINED: 'secondary',
  EXPIRED: 'dark',
  ADMIN: 'danger',
  SUPER_ADMIN: 'dark',
  RESEARCHER: 'primary',
}

export function useStatusBadge({ status }: StatusBadgeProps) {
  const key = status.toUpperCase()
  return {
    label: status,
    tone: TONE[key] ?? 'light',
  }
}
