import { PageHeader } from '../../components/PageHeader'
import { useProjects } from './useProjects'

export function ProjectsPage() {
  const vm = useProjects()
  return (
    <div className="container py-4">
      <PageHeader title={vm.t('projects.title')} subtitle={vm.t('projects.subtitle')} />
      <p className="text-muted">{vm.t('common.loading')}</p>
    </div>
  )
}
