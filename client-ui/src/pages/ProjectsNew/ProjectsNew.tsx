import { PageHeader } from '../../components/PageHeader'
import { useProjectsNew } from './useProjectsNew'

export function ProjectsNewPage() {
  const vm = useProjectsNew()
  return (
    <div className="container py-4">
      <PageHeader title={vm.t('projects.newTitle')} />
      <p className="text-muted">{vm.t('common.loading')}</p>
    </div>
  )
}
