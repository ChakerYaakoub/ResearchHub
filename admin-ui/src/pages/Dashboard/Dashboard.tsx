import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useDashboard } from './useDashboard'
import './Dashboard.css'
import '../../styles/adminLists.css'

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

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : (
        <>
          <div className="row g-3 mb-4">
            {vm.cards.map((card) => (
              <div key={card.key} className="col-12 col-md-6 col-lg-4">
                <Link to={card.to} className="rh-dash-card rh-dash-card-link">
                  <div className="rh-dash-card-label">{card.label}</div>
                  <div className="rh-dash-card-value">{card.value}</div>
                  <div className="rh-dash-card-hint">{vm.copy.viewAll}</div>
                </Link>
              </div>
            ))}
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className="h5 mb-0">{vm.copy.reviewTitle}</h2>
            <Link to="/proposals" className="btn btn-outline-primary btn-sm">
              {vm.copy.reviewAll}
            </Link>
          </div>
          {vm.proposals.length === 0 ? (
            <EmptyState message={vm.copy.reviewEmpty} />
          ) : (
            <div className="d-flex flex-column gap-3">
              {vm.proposals.map((p) => (
                <article key={p.id} className="rh-review-card">
                  <div className="d-flex flex-wrap justify-content-between gap-2 mb-1">
                    <h3 className="h6 mb-0">{p.project_title}</h3>
                    <div className="d-flex flex-wrap gap-1">
                      <StatusBadge status={p.status} />
                      {p.status === 'PENDING' && p.reviewed_at ? (
                        <StatusBadge
                          status="RESUBMITTED"
                          label={vm.copy.resubmitted}
                        />
                      ) : null}
                    </div>
                  </div>
                  <p className="small text-muted mb-0">
                    {p.submitted_at
                      ? new Date(p.submitted_at).toLocaleString()
                      : vm.copy.none}
                  </p>
                </article>
              ))}
              {vm.pendingTotal > vm.proposals.length ? (
                <p className="small text-muted mb-0">
                  +{vm.pendingTotal - vm.proposals.length} more —{' '}
                  <Link to="/proposals">{vm.copy.reviewAll}</Link>
                </p>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  )
}
