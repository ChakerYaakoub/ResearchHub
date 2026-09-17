import { SkeletonBlock, SkeletonLine } from '../../components/Skeleton'

/** Project detail loading — mirrors overview card, team, tabs, content panel. */
export function ProjectDetailsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="border rounded p-3 mb-4 bg-white">
        <SkeletonLine className="rh-skel-line--sm mb-3" style={{ width: '7rem' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="row align-items-center mb-2">
            <div className="col-sm-3 col-lg-2">
              <SkeletonLine className="rh-skel-line--xs" />
            </div>
            <div className="col-sm-9 col-lg-10">
              <SkeletonLine
                className={
                  i === 0 ? 'rh-skel-line--sm' : 'rh-skel-line rh-skel-line--full'
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded p-3 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
          <SkeletonLine className="rh-skel-line--sm" style={{ width: '5rem' }} />
          <SkeletonLine className="rh-skel-btn" />
        </div>
        <ul className="list-unstyled mb-0">
          {Array.from({ length: 2 }).map((_, i) => (
            <li
              key={i}
              className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2"
            >
              <SkeletonLine className="rh-skel-line--md" />
              <SkeletonLine className="rh-skel-badge" />
            </li>
          ))}
        </ul>
      </div>

      <div className="d-flex flex-nowrap gap-2 mb-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonLine
            key={i}
            className="rh-skel-line--sm"
            style={{ width: '5.5rem', height: '2rem' }}
          />
        ))}
      </div>

      <SkeletonBlock className="mb-0" style={{ minHeight: '8rem' }}>
        <div className="d-flex justify-content-between gap-2 mb-3">
          <SkeletonLine className="rh-skel-line--sm" />
          <SkeletonLine className="rh-skel-btn" />
        </div>
        <SkeletonLine className="rh-skel-line rh-skel-line--full mb-2" />
        <SkeletonLine className="rh-skel-line--md mb-2" />
        <SkeletonLine className="rh-skel-line rh-skel-line--full" />
      </SkeletonBlock>
    </div>
  )
}
