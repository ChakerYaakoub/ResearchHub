import { SkeletonLine } from '../../../components/Skeleton'

/** Experiments panel — list rows matching experiment cards. */
export function ExperimentsSectionSkeleton() {
  return (
    <div className="d-flex flex-column gap-3" aria-hidden="true">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rh-skel-row">
          <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
            <SkeletonLine className="rh-skel-line--md" />
            <SkeletonLine className="rh-skel-badge" />
          </div>
          <SkeletonLine className="rh-skel-line--sm mb-2" />
          <SkeletonLine className="rh-skel-line--full mb-3" />
          <div className="d-flex gap-2">
            <SkeletonLine className="rh-skel-btn" />
            <SkeletonLine className="rh-skel-btn" />
          </div>
        </div>
      ))}
    </div>
  )
}
