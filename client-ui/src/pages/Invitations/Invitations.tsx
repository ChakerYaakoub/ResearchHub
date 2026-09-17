import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { InvitationsSkeleton } from './InvitationsSkeleton'
import { useInvitations } from './useInvitations'

export function InvitationsPage() {
  const vm = useInvitations()

  return (
    <div className="container py-4">
      <PageHeader
        title={vm.t('invitations.title')}
        subtitle={vm.t('invitations.subtitle')}
      />

      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {vm.loading ? (
        <div className="position-relative">
          <LoadingState overlay label={vm.t('common.loading')} />
          <InvitationsSkeleton />
        </div>
      ) : null}

      {!vm.loading && !vm.error && vm.pending.length === 0 ? (
        <EmptyState
          title={vm.t('invitations.emptyTitle')}
          message={vm.t('invitations.empty')}
        />
      ) : null}

      {!vm.loading && vm.pending.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {vm.pending.map((inv) => {
            const busy = vm.busyToken === inv.token
            return (
              <div key={inv.id} className="border rounded p-3">
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                  <div>
                    <div className="fw-semibold">{inv.project_title}</div>
                    <div className="small text-muted">
                      {vm.t('invitations.from')}: {inv.invited_by_email}
                    </div>
                  </div>
                  <StatusBadge
                    status={inv.status}
                    label={vm.t(`status.${inv.status}`)}
                  />
                </div>
                <div className="small mb-3">
                  <span className="me-3">
                    {vm.t('invitations.role')}: {inv.role}
                  </span>
                  <span>
                    {vm.t('invitations.expires')}:{' '}
                    {new Date(inv.expires_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={busy || !inv.token}
                    onClick={() => void vm.onAccept(inv)}
                  >
                    {busy
                      ? vm.t('invitations.accepting')
                      : vm.t('invitations.accept')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={busy || !inv.token}
                    onClick={() => void vm.onDecline(inv)}
                  >
                    {busy
                      ? vm.t('invitations.declining')
                      : vm.t('invitations.decline')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
