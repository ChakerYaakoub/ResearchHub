import {
  useSkeletonBlock,
  useSkeletonLine,
  type SkeletonBlockProps,
  type SkeletonLineProps,
} from './useSkeleton'
import './Skeleton.css'

/** Shimmer line — pages compose page-specific skeletons from these. */
export function SkeletonLine(props: SkeletonLineProps) {
  const vm = useSkeletonLine(props)
  return <div className={vm.className} style={vm.style} aria-hidden="true" />
}

/** Surface panel wrapping shimmer lines. */
export function SkeletonBlock(props: SkeletonBlockProps) {
  const vm = useSkeletonBlock(props)
  return (
    <div className={vm.className} style={vm.style} aria-hidden="true">
      {vm.children}
    </div>
  )
}
