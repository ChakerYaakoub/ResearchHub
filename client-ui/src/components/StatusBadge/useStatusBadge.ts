export type StatusBadgeProps = {
  status: string
  label: string
}

export function useStatusBadge(props: StatusBadgeProps) {
  const tone =
    props.status === 'APPROVED' || props.status === 'COMPLETED'
      ? 'success'
      : props.status === 'REJECTED'
        ? 'danger'
        : props.status === 'UNDER_REVIEW' || props.status === 'SUBMITTED'
          ? 'warning'
          : 'secondary'

  return { ...props, tone }
}
