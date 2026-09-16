import { useStatusBadge, type StatusBadgeProps } from './useStatusBadge'
import './StatusBadge.css'

export function StatusBadge(props: StatusBadgeProps) {
  const vm = useStatusBadge(props)
  return <span className={vm.className}>{vm.label}</span>
}
