import { useEmptyState, type EmptyStateProps } from './useEmptyState'
import './EmptyState.css'

/** Centered empty placeholder for admin list pages. */
export function EmptyState(props: EmptyStateProps) {
  const vm = useEmptyState(props)
  const className = [
    'rh-empty',
    vm.compact ? 'rh-empty--compact' : '',
    vm.className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className} role="status">
      <div className="rh-empty-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="4.5" y="6.5" width="15" height="12" rx="1.5" />
          <path strokeLinecap="round" d="M8 10.5h8M8 14h5" />
        </svg>
      </div>
      {vm.title ? <p className="rh-empty-title">{vm.title}</p> : null}
      <p className="rh-empty-message">{vm.message}</p>
      {vm.action ? <div className="rh-empty-action">{vm.action}</div> : null}
    </div>
  )
}
