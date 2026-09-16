import { useEmptyState, type EmptyStateProps } from './useEmptyState'

export function EmptyState(props: EmptyStateProps) {
  const vm = useEmptyState(props)
  return <p className="text-muted mb-0">{vm.message}</p>
}
