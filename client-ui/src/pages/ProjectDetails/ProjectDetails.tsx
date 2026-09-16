import { PageHeader } from '../../components/PageHeader'
import { useProjectDetails } from './useProjectDetails'

export function ProjectDetailsPage() {
  const vm = useProjectDetails()
  return (
    <div className="container py-4">
      <PageHeader title={vm.t('projects.detailTitle')} />
      <p className="text-muted">{vm.t('common.loading')}</p>
    </div>
  )
}
