import { Link } from 'react-router-dom'
import { LoadingState } from '../../components/LoadingState'
import { PageHeader } from '../../components/PageHeader'
import { useDashboard } from './useDashboard'

export function DashboardPage() {
  const vm = useDashboard()

  return (
    <div className="container py-4">
      <PageHeader
        title={vm.t('dashboard.title')}
        subtitle={vm.t('dashboard.subtitle')}
        actions={
          <>
            <Link className="btn btn-outline-secondary btn-sm" to="/projects">
              {vm.t('dashboard.viewProjects')}
            </Link>
            <Link className="btn btn-outline-secondary btn-sm" to="/invitations">
              {vm.t('dashboard.viewInvitations')}
            </Link>
            <Link className="btn btn-primary btn-sm" to="/projects/new">
              {vm.t('dashboard.newProject')}
            </Link>
          </>
        }
      />

      {vm.loading ? <LoadingState label={vm.t('common.loading')} /> : null}
      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {!vm.loading && !vm.error ? (
        <div className="row g-3">
          {vm.cards.map((card) => {
            const body = (
              <>
                <div className="text-muted small mb-1">{vm.t(card.titleKey)}</div>
                <div className={`display-6 mb-0${card.muted ? ' text-muted' : ''}`}>
                  {card.value}
                </div>
                {card.hintKey ? (
                  <div className="small text-muted mt-2">{vm.t(card.hintKey)}</div>
                ) : null}
              </>
            )
            return (
              <div key={card.key} className="col-12 col-md-6 col-lg-4">
                {card.to ? (
                  <Link
                    to={card.to}
                    className="text-decoration-none text-body d-block border rounded p-3 h-100"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="border rounded p-3 h-100">{body}</div>
                )}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
