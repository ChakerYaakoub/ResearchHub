import type { ReactNode } from 'react'

export type PageHeaderProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

/** Shared page title row for dashboard screens. */
export function usePageHeader(props: PageHeaderProps) {
  return props
}
