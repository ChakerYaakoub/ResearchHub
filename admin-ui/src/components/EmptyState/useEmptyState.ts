import type { ReactNode } from 'react'

export type EmptyStateProps = {
  message: string
  title?: string
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function useEmptyState(props: EmptyStateProps) {
  return {
    message: props.message,
    title: props.title,
    action: props.action,
    compact: Boolean(props.compact),
    className: props.className ?? '',
  }
}
