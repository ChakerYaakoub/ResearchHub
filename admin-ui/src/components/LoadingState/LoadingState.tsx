import { useLoadingState, type LoadingStateProps } from './useLoadingState'
import './LoadingState.css'

/** Loading spinner for admin list/detail fetches. */
export function LoadingState(props: LoadingStateProps) {
  const vm = useLoadingState(props)
  const className = [
    'rh-loading',
    vm.compact ? 'rh-loading--compact' : '',
    vm.overlay ? 'rh-loading--overlay' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rh-loading-spinner" aria-hidden="true" />
      <span className="rh-loading-label">{vm.label}</span>
    </div>
  )
}
