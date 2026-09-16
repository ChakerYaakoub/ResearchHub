import { SkeletonLine } from '../../../components/Skeleton'

/** Proposal panel — status + two tall text fields. */
export function ProposalSectionSkeleton() {
  return (
    <div aria-hidden="true">
      <SkeletonLine className="rh-skel-line--xs mb-3" />
      <SkeletonLine className="rh-skel-line--full mb-2" style={{ height: '4.5rem' }} />
      <SkeletonLine className="rh-skel-line--xs mb-2 mt-3" />
      <SkeletonLine className="rh-skel-line--full mb-3" style={{ height: '4.5rem' }} />
      <div className="d-flex gap-2">
        <SkeletonLine className="rh-skel-btn" />
        <SkeletonLine className="rh-skel-btn" />
      </div>
    </div>
  )
}
