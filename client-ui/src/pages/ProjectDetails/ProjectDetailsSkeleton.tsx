import { SkeletonBlock, SkeletonLine } from '../../components/Skeleton'

/** Project detail — status, metadata rows, collaborators, domain panels. */
export function ProjectDetailsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <SkeletonLine className="rh-skel-badge" />
        <SkeletonLine className="rh-skel-line--sm" />
      </div>

      <div className="row mb-4 gy-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="col-12">
            <div className="row align-items-center">
              <div className="col-sm-3 col-lg-2">
                <SkeletonLine className="rh-skel-line--xs" />
              </div>
              <div className="col-sm-9 col-lg-10">
                <SkeletonLine
                  className={i === 0 ? 'rh-skel-line--sm' : 'rh-skel-line--full'}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <SkeletonLine className="rh-skel-line--sm mb-3" style={{ width: '8rem' }} />
      <ul className="list-unstyled mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="rh-skel-row d-flex justify-content-between gap-2 mb-2"
          >
            <SkeletonLine className="rh-skel-line--md" />
            <SkeletonLine className="rh-skel-badge" />
          </li>
        ))}
      </ul>

      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} className="mb-4" style={{ minHeight: '7rem' }}>
          <div className="d-flex justify-content-between gap-2 mb-3">
            <SkeletonLine className="rh-skel-line--sm" />
            <SkeletonLine className="rh-skel-btn" />
          </div>
          <SkeletonLine className="rh-skel-line--full mb-2" />
          <SkeletonLine className="rh-skel-line--md mb-2" />
          <SkeletonLine className="rh-skel-line--full" />
        </SkeletonBlock>
      ))}
    </div>
  )
}
