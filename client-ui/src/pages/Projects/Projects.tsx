import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { useProjects } from './useProjects'

export function ProjectsPage() {
  const vm = useProjects()

  return (
    <div className="container py-4">
      <PageHeader
        title={vm.t('projects.title')}
        subtitle={vm.t('projects.subtitle')}
        actions={
          <Link className="btn btn-primary btn-sm" to="/projects/new">
            {vm.t('projects.createCta')}
          </Link>
        }
      />

      {vm.loading ? <LoadingState label={vm.t('common.loading')} /> : null}
      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {!vm.loading && !vm.error && vm.projects.length === 0 ? (
        <EmptyState message={vm.t('projects.empty')} />
      ) : null}

      {!vm.loading && vm.projects.length > 0 ? (
        <>
          <div className="d-none d-md-block table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">{vm.t('projects.fieldTitle')}</th>
                  <th scope="col">{vm.t('projects.status')}</th>
                  <th scope="col">{vm.t('projects.owner')}</th>
                </tr>
              </thead>
              <tbody>
                {vm.projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/projects/${p.id}`}>{p.title}</Link>
                    </td>
                    <td>
                      <StatusBadge
                        status={p.status}
                        label={vm.t(`status.${p.status}`)}
                      />
                    </td>
                    <td className="text-break">{p.owner_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-md-none d-flex flex-column gap-3">
            {vm.projects.map((p) => (
              <div key={p.id} className="border rounded p-3">
                <div className="d-flex justify-content-between gap-2 mb-2">
                  <Link className="fw-semibold" to={`/projects/${p.id}`}>
                    {p.title}
                  </Link>
                  <StatusBadge
                    status={p.status}
                    label={vm.t(`status.${p.status}`)}
                  />
                </div>
                <div className="small text-muted text-break">{p.owner_email}</div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
