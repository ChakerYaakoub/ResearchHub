import { SkeletonLine } from '../../components/Skeleton'

/** Invitations — invite cards with meta + action button placeholders. */
export function InvitationsSkeleton() {
  return (
    <div className="d-flex flex-column gap-3" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rh-skel-row">
          <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
            <div className="flex-grow-1" style={{ minWidth: '12rem' }}>
              <SkeletonLine className="rh-skel-line--md mb-2" />
              <SkeletonLine className="rh-skel-line--sm" />
            </div>
            <SkeletonLine className="rh-skel-badge" />
          </div>
          <div className="d-flex flex-wrap gap-3 mb-3">
            <SkeletonLine className="rh-skel-line--xs" />
            <SkeletonLine className="rh-skel-line--xs" />
          </div>
          <div className="d-flex flex-wrap gap-2">
            <SkeletonLine className="rh-skel-btn" />
            <SkeletonLine className="rh-skel-btn" />
          </div>
        </div>
      ))}
    </div>
  )
}
