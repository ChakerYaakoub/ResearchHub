import { SkeletonLine } from '../../components/Skeleton'

/** Projects list — table on md+, card rows on mobile. */
export function ProjectsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="d-none d-md-block table-responsive">
        <table className="rh-skel-table table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col" style={{ width: '40%' }}>
                <SkeletonLine className="rh-skel-line--sm" />
              </th>
              <th scope="col" style={{ width: '20%' }}>
                <SkeletonLine className="rh-skel-line--xs" />
              </th>
              <th scope="col">
                <SkeletonLine className="rh-skel-line--sm" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td>
                  <SkeletonLine className="rh-skel-line--md" />
                </td>
                <td>
                  <SkeletonLine className="rh-skel-badge" />
                </td>
                <td>
                  <SkeletonLine className="rh-skel-line--sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-md-none d-flex flex-column gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rh-skel-row">
            <div className="d-flex justify-content-between gap-2 mb-2">
              <SkeletonLine className="rh-skel-line--md" />
              <SkeletonLine className="rh-skel-badge" />
            </div>
            <SkeletonLine className="rh-skel-line--sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
