import { usePageHeader, type PageHeaderProps } from './usePageHeader'

/** Title + optional actions for researcher app pages. */
export function PageHeader(props: PageHeaderProps) {
  const vm = usePageHeader(props)

  return (
    <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-2 mb-4">
      <div>
        <h1 className="h3 mb-1">{vm.title}</h1>
        {vm.subtitle ? (
          <p className="text-muted mb-0 small">{vm.subtitle}</p>
        ) : null}
      </div>
      {vm.actions ? <div className="d-flex flex-wrap gap-2">{vm.actions}</div> : null}
    </div>
  )
}
