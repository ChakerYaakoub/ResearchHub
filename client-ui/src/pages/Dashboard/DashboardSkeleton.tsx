import { SkeletonBlock, SkeletonLine } from '../../components/Skeleton'

/** Dashboard home — summary card grid (matches live cards layout). */
export function DashboardSkeleton() {
  return (
    <div className="row g-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="col-12 col-md-6 col-lg-4">
          <SkeletonBlock>
            <SkeletonLine className="rh-skel-line--sm" />
            <SkeletonLine className="rh-skel-line--lg mt-3" />
            <SkeletonLine className="rh-skel-line--xs mt-auto pt-3" />
          </SkeletonBlock>
        </div>
      ))}
    </div>
  )
}
