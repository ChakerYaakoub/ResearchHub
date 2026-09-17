import type { ReactNode } from 'react'

export type EmptyStateProps = {
  message: string
  /** Optional short heading above the message. */
  title?: string
  /** Optional CTA (e.g. button/link). */
  action?: ReactNode
  /** Tighter padding for section panels. */
  compact?: boolean
  className?: string
}

/** Pass-through props for EmptyState (centered no-data placeholder). */
export function useEmptyState(props: EmptyStateProps) {
  return {
    message: props.message,
    title: props.title,
    action: props.action,
    compact: Boolean(props.compact),
    className: props.className ?? '',
  }
}
