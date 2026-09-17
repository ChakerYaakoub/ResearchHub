import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useProposals, type ProposalFilter } from './useProposals'
import '../../styles/adminLists.css'

const FILTERS: {
  value: ProposalFilter
  labelKey:
    | 'filterAll'
    | 'filterDraft'
    | 'filterPending'
    | 'filterApproved'
    | 'filterRejected'
}[] = [
  { value: '', labelKey: 'filterAll' },
  { value: 'DRAFT', labelKey: 'filterDraft' },
  { value: 'PENDING', labelKey: 'filterPending' },
  { value: 'APPROVED', labelKey: 'filterApproved' },
  { value: 'REJECTED', labelKey: 'filterRejected' },
]

export function ProposalsPage() {
  const vm = useProposals()

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      <div className="rh-admin-toolbar" role="group" aria-label={vm.copy.status}>
        {FILTERS.map((f) => (
          <button
            key={f.labelKey}
            type="button"
            className={`btn btn-sm ${
              vm.filter === f.value ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => vm.setFilter(f.value)}
          >
            {vm.copy[f.labelKey]}
          </button>
        ))}
      </div>

      {vm.searchUi}

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
      ) : vm.proposals.length === 0 ? (
        <EmptyState message={vm.copy.proposalsEmpty} />
      ) : (
        <div className="d-flex flex-column gap-3">
          {vm.proposals.map((p) => (
            <article key={p.id} className="rh-admin-item-card">
              <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                <h3 className="h6 mb-0">{p.project_title}</h3>
                <div className="d-flex flex-wrap gap-1">
                  {p.project_status === 'DRAFT' ? (
                    <StatusBadge
                      status="DRAFT"
                      label={vm.copy.filterDraft}
                    />
                  ) : (
                    <StatusBadge status={p.status} />
                  )}
                  {p.status === 'PENDING' &&
                  p.project_status === 'UNDER_REVIEW' &&
                  p.reviewed_at ? (
                    <StatusBadge
                      status="RESUBMITTED"
                      label={vm.copy.resubmitted}
                    />
                  ) : null}
                </div>
              </div>
              <dl className="row small mb-3">
                <dt className="col-sm-3">{vm.copy.methodology}</dt>
                <dd className="col-sm-9">
                  {p.methodology || <span className="text-muted">{vm.copy.none}</span>}
                </dd>
                <dt className="col-sm-3">{vm.copy.expectedResults}</dt>
                <dd className="col-sm-9">
                  {p.expected_results || (
                    <span className="text-muted">{vm.copy.none}</span>
                  )}
                </dd>
                {p.submitted_at ? (
                  <>
                    <dt className="col-sm-3">{vm.copy.submittedAt}</dt>
                    <dd className="col-sm-9">
                      {new Date(p.submitted_at).toLocaleString()}
                    </dd>
                  </>
                ) : null}
                {p.status === 'PENDING' && p.review_comment ? (
                  <>
                    <dt className="col-sm-3">
                      {vm.copy.previousReviewComment}
                    </dt>
                    <dd className="col-sm-9">{p.review_comment}</dd>
                  </>
                ) : null}
                {p.reviewed_at ? (
                  <>
                    <dt className="col-sm-3">{vm.copy.reviewedAt}</dt>
                    <dd className="col-sm-9 mb-0">
                      {new Date(p.reviewed_at).toLocaleString()}
                    </dd>
                  </>
                ) : null}
              </dl>
              {p.status === 'PENDING' &&
              p.project_status === 'UNDER_REVIEW' ? (
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
              ) : null}
            </article>
          ))}
        </div>
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
          <label className="form-label" htmlFor="admin_review_comment">
            {vm.copy.reviewComment}
          </label>
          <textarea
            id="admin_review_comment"
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
