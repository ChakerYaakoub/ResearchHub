import { Link } from 'react-router-dom'
import { LoadingState } from '../../components/LoadingState'
import { DashboardSkeleton } from './DashboardSkeleton'
import { useDashboard } from './useDashboard'
import './Dashboard.css'

export function DashboardPage() {
  const vm = useDashboard()

  return (
    <div className="rh-dash-page container-fluid px-3 px-md-4 py-4">
      <div className="rh-dash-page-toolbar d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-2 mb-4">
        <p className="rh-dash-page-lead text-muted mb-0">{vm.t('dashboard.subtitle')}</p>
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-outline-secondary btn-sm" to="/projects">
            {vm.t('dashboard.viewProjects')}
          </Link>
          <Link className="btn btn-outline-secondary btn-sm" to="/invitations">
            {vm.t('dashboard.viewInvitations')}
          </Link>
          <Link className="btn btn-primary btn-sm" to="/projects/new">
            {vm.t('dashboard.newProject')}
          </Link>
        </div>
      </div>

      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {vm.loading ? (
        <div className="position-relative">
          <LoadingState overlay label={vm.t('common.loading')} />
          <DashboardSkeleton />
        </div>
      ) : null}

      {!vm.loading && !vm.error ? (
        <div className="row g-3 rh-dash-cards">
          {vm.cards.map((card) => (
            <div key={card.key} className="col-12 col-md-6 col-lg-4">
              <div className="rh-dash-card">
                <div className="rh-dash-card-label">{vm.t(card.titleKey)}</div>
                <div className="rh-dash-card-value">{card.value}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
