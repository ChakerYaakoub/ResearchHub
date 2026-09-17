import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { Popup } from '../../components/Popup'
import { StatusBadge } from '../../components/StatusBadge'
import { usePublications } from './usePublications'
import '../../styles/adminLists.css'

export function PublicationsPage() {
  const vm = usePublications()
  const selected = vm.selected

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
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-start text-decoration-underline"
                        onClick={() => vm.openDetail(p)}
                      >
                        {p.title}
                      </button>
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
              <button
                key={p.id}
                type="button"
                className="rh-admin-item-card text-start w-100 border-0"
                onClick={() => vm.openDetail(p)}
              >
                <h3 className="h6 mb-1">{p.title}</h3>
                <p className="small text-muted mb-1">{p.project_title}</p>
                <p className="small mb-0">
                  {p.authors}
                  {p.journal ? ` · ${p.journal}` : ''}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      <Popup
        open={selected != null}
        onClose={vm.closeDetail}
        title={vm.copy.publicationDetailTitle}
        size="md"
      >
        {selected ? (
          <dl className="row small mb-0">
            <dt className="col-sm-3">{vm.copy.title}</dt>
            <dd className="col-sm-9">{selected.title}</dd>
            <dt className="col-sm-3">{vm.copy.kind}</dt>
            <dd className="col-sm-9">
              {selected.kind ? (
                <StatusBadge status={selected.kind} />
              ) : (
                vm.copy.none
              )}
            </dd>
            <dt className="col-sm-3">{vm.copy.project}</dt>
            <dd className="col-sm-9">
              <Link
                to={`/projects/${selected.project}`}
                onClick={vm.closeDetail}
              >
                {selected.project_title}
              </Link>
            </dd>
            <dt className="col-sm-3">{vm.copy.authors}</dt>
            <dd className="col-sm-9">{selected.authors || vm.copy.none}</dd>
            <dt className="col-sm-3">{vm.copy.journal}</dt>
            <dd className="col-sm-9">{selected.journal || vm.copy.none}</dd>
            <dt className="col-sm-3">{vm.copy.doi}</dt>
            <dd className="col-sm-9">{selected.doi || vm.copy.none}</dd>
            <dt className="col-sm-3">{vm.copy.publicationDate}</dt>
            <dd className="col-sm-9">
              {selected.publication_date
                ? new Date(selected.publication_date).toLocaleDateString()
                : vm.copy.none}
            </dd>
            <dt className="col-sm-3">{vm.copy.url}</dt>
            <dd className="col-sm-9 mb-0">
              {selected.url ? (
                <a href={selected.url} target="_blank" rel="noreferrer">
                  {selected.url}
                </a>
              ) : (
                vm.copy.none
              )}
            </dd>
          </dl>
        ) : null}
      </Popup>
    </div>
  )
}
