import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { useDashboard } from './useDashboard'
import './Dashboard.css'

export function DashboardPage() {
  const vm = useDashboard()

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <p className="rh-dash-page-lead text-muted mb-4">
        {vm.copy.dashboardSubtitle}
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
      ) : (
        <>
          <div className="row g-3 mb-4">
            {vm.cards.map((card) => (
              <div key={card.key} className="col-12 col-md-6 col-lg-4">
                <div className="rh-dash-card">
                  <div className="rh-dash-card-label">{card.label}</div>
                  <div className="rh-dash-card-value">{card.value}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="h5 mb-3">{vm.copy.reviewTitle}</h2>
          {vm.proposals.length === 0 ? (
            <EmptyState message={vm.copy.reviewEmpty} />
          ) : (
            <div className="d-flex flex-column gap-3">
              {vm.proposals.map((p) => (
                <article key={p.id} className="rh-review-card">
                  <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                    <h3 className="h6 mb-0">{p.project_title}</h3>
                    <span className="badge text-bg-light">{p.status}</span>
                  </div>
                  <dl className="row small mb-3">
                    <dt className="col-sm-3">{vm.copy.methodology}</dt>
                    <dd className="col-sm-9">
                      {p.methodology || <span className="text-muted">—</span>}
                    </dd>
                    <dt className="col-sm-3">{vm.copy.expectedResults}</dt>
                    <dd className="col-sm-9">
                      {p.expected_results || (
                        <span className="text-muted">—</span>
                      )}
                    </dd>
                    {p.submitted_at ? (
                      <>
                        <dt className="col-sm-3">{vm.copy.submittedAt}</dt>
                        <dd className="col-sm-9 mb-0">
                          {new Date(p.submitted_at).toLocaleString()}
                        </dd>
                      </>
                    ) : null}
                  </dl>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => vm.openReview('approve', p)}
                    >
                      {vm.copy.approve}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => vm.openReview('reject', p)}
                    >
                      {vm.copy.reject}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={vm.reviewKind != null && vm.pending != null}
        title={
          vm.reviewKind === 'reject'
            ? vm.copy.rejectTitle
            : vm.copy.approveTitle
        }
        message={
          vm.reviewKind === 'reject'
            ? vm.copy.rejectMessage
            : vm.copy.approveMessage
        }
        confirmLabel={
          vm.reviewKind === 'reject' ? vm.copy.reject : vm.copy.approve
        }
        cancelLabel={vm.copy.cancel}
        busy={vm.busy}
        busyLabel={
          vm.reviewKind === 'reject' ? vm.copy.rejecting : vm.copy.approving
        }
        danger={vm.reviewKind === 'reject'}
        onConfirm={() => void vm.confirmReview()}
        onClose={vm.closeReview}
      >
        <div className="mb-3">
          <label className="form-label" htmlFor="review_comment">
            {vm.copy.reviewComment}
          </label>
          <textarea
            id="review_comment"
            className="form-control"
            rows={2}
            value={vm.reviewComment}
            onChange={(e) => vm.setReviewComment(e.target.value)}
            disabled={vm.busy}
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
