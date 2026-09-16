import { SkeletonLine } from '../../../components/Skeleton'

/** Publications panel — title / meta / link-shaped rows. */
export function PublicationsSectionSkeleton() {
  return (
    <div className="d-flex flex-column gap-3" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rh-skel-row">
          <SkeletonLine className="rh-skel-line--md mb-2" />
          <SkeletonLine className="rh-skel-line--sm mb-2" />
          <div className="d-flex flex-wrap gap-3 mb-3">
            <SkeletonLine className="rh-skel-line--xs" />
            <SkeletonLine className="rh-skel-line--xs" />
          </div>
          <div className="d-flex gap-2">
            <SkeletonLine className="rh-skel-btn" />
            <SkeletonLine className="rh-skel-btn" />
          </div>
        </div>
      ))}
    </div>
  )
}
