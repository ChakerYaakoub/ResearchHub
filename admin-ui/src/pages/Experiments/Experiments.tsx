import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useExperiments } from './useExperiments'
import '../../styles/adminLists.css'

export function ExperimentsPage() {
  const vm = useExperiments()

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : vm.items.length === 0 ? (
        <EmptyState message={vm.copy.experimentsEmpty} />
      ) : (
        <>
          <div className="d-none d-md-block rh-admin-table-wrap">
            <table className="table rh-admin-table align-middle">
              <thead>
                <tr>
                  <th scope="col">{vm.copy.project}</th>
                  <th scope="col">{vm.copy.instrument}</th>
                  <th scope="col">{vm.copy.scheduledDate}</th>
                  <th scope="col">{vm.copy.status}</th>
                </tr>
              </thead>
              <tbody>
                {vm.items.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link to={`/projects/${e.project}`}>{e.project_title}</Link>
                    </td>
                    <td>
                      {e.instrument_code
                        ? `${e.instrument_code}${e.instrument_name ? ` · ${e.instrument_name}` : ''}`
                        : String(e.instrument)}
                      {e.installation_name ? (
                        <div className="small text-muted">
                          {e.installation_name}
                        </div>
                      ) : null}
                    </td>
                    <td>{new Date(e.scheduled_date).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-md-none rh-admin-card-list">
            {vm.items.map((e) => (
              <article key={e.id} className="rh-admin-item-card">
                <div className="d-flex justify-content-between gap-2 mb-2">
                  <Link to={`/projects/${e.project}`} className="fw-semibold">
                    {e.project_title}
                  </Link>
                  <StatusBadge status={e.status} />
                </div>
                <p className="small mb-0">
                  {e.instrument_code || e.instrument}
                  {e.installation_name ? ` · ${e.installation_name}` : ''} ·{' '}
                  {new Date(e.scheduled_date).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
