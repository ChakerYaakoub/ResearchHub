import { useStatusBadge, type StatusBadgeProps } from './useStatusBadge'

export function StatusBadge(props: StatusBadgeProps) {
  const vm = useStatusBadge(props)
  return (
    <span className={`badge text-bg-${vm.tone}`}>{vm.label}</span>
  )
}
