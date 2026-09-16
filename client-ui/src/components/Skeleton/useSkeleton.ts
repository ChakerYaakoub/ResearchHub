import type { CSSProperties, ReactNode } from 'react'

/** Shared shimmer building blocks — pages compose their own skeletons. */
export type SkeletonLineProps = {
  className?: string
  style?: CSSProperties
}

export type SkeletonBlockProps = {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function useSkeletonLine(props: SkeletonLineProps) {
  return {
    className: ['rh-skel', props.className].filter(Boolean).join(' '),
    style: props.style,
  }
}

export function useSkeletonBlock(props: SkeletonBlockProps) {
  return {
    className: ['rh-skel-block', props.className].filter(Boolean).join(' '),
    style: props.style,
    children: props.children,
  }
}
