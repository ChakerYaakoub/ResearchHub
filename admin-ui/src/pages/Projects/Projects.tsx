import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useProjects } from './useProjects'
import '../../styles/adminLists.css'

export function ProjectsPage() {
  const vm = useProjects()

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : vm.projects.length === 0 ? (
        <EmptyState message={vm.copy.projectsEmpty} />
      ) : (
        <>
          <div className="d-none d-md-block rh-admin-table-wrap">
            <table className="table rh-admin-table align-middle">
              <thead>
                <tr>
                  <th scope="col">{vm.copy.title}</th>
                  <th scope="col">{vm.copy.status}</th>
                  <th scope="col">{vm.copy.owner}</th>
                  <th scope="col">{vm.copy.createdAt}</th>
                </tr>
              </thead>
              <tbody>
                {vm.projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/projects/${p.id}`}>{p.title}</Link>
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>{p.owner_email}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-md-none rh-admin-card-list">
            {vm.projects.map((p) => (
              <article key={p.id} className="rh-admin-item-card">
                <div className="d-flex justify-content-between gap-2 mb-2">
                  <Link to={`/projects/${p.id}`} className="fw-semibold">
                    {p.title}
                  </Link>
                  <StatusBadge status={p.status} />
                </div>
                <p className="small text-muted mb-0">
                  {p.owner_email} ·{' '}
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
