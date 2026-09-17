export type LoadingStateProps = {
  label: string
  /** Compact inline spinner vs centered block (default). */
  compact?: boolean
  /**
   * Absolute overlay over a `position-relative` parent (spinner on top of skeleton).
   * Does not take document flow space.
   */
  overlay?: boolean
}

/** Pass-through props for LoadingState (spinner / overlay variants). */
export function useLoadingState(props: LoadingStateProps) {
  return {
    label: props.label,
    compact: Boolean(props.compact),
    overlay: Boolean(props.overlay),
  }
}
