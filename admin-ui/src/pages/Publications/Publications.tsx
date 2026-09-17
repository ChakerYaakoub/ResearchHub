import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { usePublications } from './usePublications'
import '../../styles/adminLists.css'

export function PublicationsPage() {
  const vm = usePublications()

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {vm.filtersUi}

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : vm.items.length === 0 ? (
        <EmptyState message={vm.copy.publicationsEmpty} />
      ) : (
        <>
          <div className="d-none d-md-block rh-admin-table-wrap">
            <table className="table rh-admin-table align-middle">
              <thead>
                <tr>
                  <th scope="col">{vm.copy.title}</th>
                  <th scope="col">{vm.copy.project}</th>
                  <th scope="col">{vm.copy.authors}</th>
                  <th scope="col">{vm.copy.journal}</th>
                  <th scope="col">{vm.copy.publicationDate}</th>
                </tr>
              </thead>
              <tbody>
                {vm.items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer">
                          {p.title}
                        </a>
                      ) : (
                        p.title
                      )}
                    </td>
                    <td>
                      <Link to={`/projects/${p.project}`}>{p.project_title}</Link>
                    </td>
                    <td>{p.authors}</td>
                    <td>{p.journal || vm.copy.none}</td>
                    <td>
                      {p.publication_date
                        ? new Date(p.publication_date).toLocaleDateString()
                        : vm.copy.none}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-md-none rh-admin-card-list">
            {vm.items.map((p) => (
              <article key={p.id} className="rh-admin-item-card">
                <h3 className="h6 mb-1">{p.title}</h3>
                <p className="small text-muted mb-1">
                  <Link to={`/projects/${p.project}`}>{p.project_title}</Link>
                </p>
                <p className="small mb-0">
                  {p.authors}
                  {p.journal ? ` · ${p.journal}` : ''}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
