import { useLoadingState, type LoadingStateProps } from './useLoadingState'
import './LoadingState.css'

export function LoadingState(props: LoadingStateProps) {
  const vm = useLoadingState(props)

  return (
    <div
      className={`rh-loading${vm.compact ? ' rh-loading--compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rh-loading-spinner" aria-hidden="true" />
      <span className="rh-loading-label">{vm.label}</span>
    </div>
  )
}
