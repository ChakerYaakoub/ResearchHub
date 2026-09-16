import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useUsers } from './useUsers'
import '../../styles/adminLists.css'

export function UsersPage() {
  const vm = useUsers()

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      <p className="text-muted small mb-3" style={{ maxWidth: '36rem' }}>
        {vm.copy.usersSubtitle}
      </p>

      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}
      {vm.actionError ? (
        <div className="alert alert-danger" role="alert">
          {vm.actionError}
        </div>
      ) : null}

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : vm.users.length === 0 ? (
        <EmptyState message={vm.copy.usersEmpty} />
      ) : (
        <>
          <div className="d-none d-md-block rh-admin-table-wrap">
            <table className="table rh-admin-table align-middle">
              <thead>
                <tr>
                  <th scope="col">{vm.copy.email}</th>
                  <th scope="col">{vm.copy.username}</th>
                  <th scope="col">{vm.copy.role}</th>
                  <th scope="col">{vm.copy.active}</th>
                  <th scope="col">{vm.copy.dateJoined}</th>
                  <th scope="col">{vm.copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {vm.users.map((u) => {
                  const isSelf = u.id === vm.meId
                  const busy = vm.busyId === u.id
                  return (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>
                        <StatusBadge status={u.role} />
                      </td>
                      <td>
                        {u.is_active ? vm.copy.active : vm.copy.inactive}
                      </td>
                      <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                      <td>
                        {!isSelf ? (
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            disabled={busy}
                            onClick={() =>
                              void vm.setActive(u.id, !u.is_active)
                            }
                          >
                            {u.is_active
                              ? vm.copy.deactivate
                              : vm.copy.activate}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="d-md-none rh-admin-card-list">
            {vm.users.map((u) => {
              const isSelf = u.id === vm.meId
              const busy = vm.busyId === u.id
              return (
                <article key={u.id} className="rh-admin-item-card">
                  <div className="d-flex justify-content-between gap-2 mb-2">
                    <strong className="text-break">{u.email}</strong>
                    <StatusBadge status={u.role} />
                  </div>
                  <p className="small text-muted mb-2">
                    {u.username} ·{' '}
                    {u.is_active ? vm.copy.active : vm.copy.inactive}
                  </p>
                  {!isSelf ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={busy}
                      onClick={() => void vm.setActive(u.id, !u.is_active)}
                    >
                      {u.is_active ? vm.copy.deactivate : vm.copy.activate}
                    </button>
                  ) : null}
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
