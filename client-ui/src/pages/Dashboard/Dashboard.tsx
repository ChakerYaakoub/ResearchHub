import { PageHeader } from '../../components/PageHeader'
import { useDashboard } from './useDashboard'

/** Researcher home — summary cards (filled in later task). */
export function DashboardPage() {
  const vm = useDashboard()

  return (
    <div className="container py-4">
      <PageHeader
        title={vm.t('dashboard.title')}
        subtitle={vm.t('dashboard.subtitle')}
      />
      <p className="text-muted">{vm.t('common.loading')}</p>
    </div>
  )
}
