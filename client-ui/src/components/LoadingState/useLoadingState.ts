export type LoadingStateProps = {
  label: string
  /** Compact inline spinner vs centered block (default). */
  compact?: boolean
}

export function useLoadingState(props: LoadingStateProps) {
  return {
    label: props.label,
    compact: Boolean(props.compact),
  }
}
