import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useInvitations } from './useInvitations'
import '../../styles/adminLists.css'

export function InvitationsPage() {
  const vm = useInvitations()

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
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

      {vm.filtersUi}

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : vm.items.length === 0 ? (
        <EmptyState message={vm.copy.invitationsEmpty} />
      ) : (
        <>
          <div className="d-none d-md-block rh-admin-table-wrap">
            <table className="table rh-admin-table align-middle">
              <thead>
                <tr>
                  <th scope="col">{vm.copy.email}</th>
                  <th scope="col">{vm.copy.project}</th>
                  <th scope="col">{vm.copy.role}</th>
                  <th scope="col">{vm.copy.status}</th>
                  <th scope="col">{vm.copy.invitedBy}</th>
                  <th scope="col">{vm.copy.expiresAt}</th>
                  <th scope="col">{vm.copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {vm.items.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.email}</td>
                    <td>
                      <Link to={`/projects/${inv.project}`}>
                        {inv.project_title}
                      </Link>
                    </td>
                    <td>{inv.role}</td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td>{inv.invited_by_email}</td>
                    <td>{new Date(inv.expires_at).toLocaleString()}</td>
                    <td>
                      {inv.status === 'PENDING' ? (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => vm.setPending(inv)}
                        >
                          {vm.copy.cancelInvite}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-md-none rh-admin-card-list">
            {vm.items.map((inv) => (
              <article key={inv.id} className="rh-admin-item-card">
                <div className="d-flex justify-content-between gap-2 mb-2">
                  <strong className="text-break">{inv.email}</strong>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="small text-muted mb-2">
                  <Link to={`/projects/${inv.project}`}>{inv.project_title}</Link>{' '}
                  · {inv.role}
                </p>
                {inv.status === 'PENDING' ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => vm.setPending(inv)}
                  >
                    {vm.copy.cancelInvite}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={vm.pending != null}
        title={vm.copy.cancelInviteTitle}
        message={vm.copy.cancelInviteMessage}
        confirmLabel={vm.copy.cancelInvite}
        cancelLabel={vm.copy.cancel}
        busy={vm.busy}
        busyLabel={vm.copy.cancelling}
        danger
        onConfirm={() => void vm.confirmCancel()}
        onClose={() => {
          if (!vm.busy) vm.setPending(null)
        }}
      />
    </div>
  )
}
