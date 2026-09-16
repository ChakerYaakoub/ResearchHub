import { useLoadingState, type LoadingStateProps } from './useLoadingState'

export function LoadingState(props: LoadingStateProps) {
  const vm = useLoadingState(props)
  return (
    <div className="text-muted py-4" role="status">
      {vm.label}
    </div>
  )
}
