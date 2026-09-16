export type StatusBadgeProps = {
  status: string
  label: string
}

export function useStatusBadge(props: StatusBadgeProps) {
  const tone =
    props.status === 'APPROVED' || props.status === 'COMPLETED'
      ? 'success'
      : props.status === 'REJECTED' || props.status === 'CANCELLED'
        ? 'danger'
        : props.status === 'UNDER_REVIEW' ||
            props.status === 'SUBMITTED' ||
            props.status === 'RESUBMITTED' ||
            props.status === 'PENDING' ||
            props.status === 'SCHEDULED'
          ? 'warning'
          : 'secondary'

  return { ...props, tone }
}
