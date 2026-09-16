export type LoadingStateProps = {
  label: string
  compact?: boolean
  overlay?: boolean
}

export function useLoadingState(props: LoadingStateProps) {
  return {
    label: props.label,
    compact: Boolean(props.compact),
    overlay: Boolean(props.overlay),
  }
}
