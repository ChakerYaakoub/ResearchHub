import { PageHeader } from '../../components/PageHeader'
import { useInvitations } from './useInvitations'

export function InvitationsPage() {
  const vm = useInvitations()
  return (
    <div className="container py-4">
      <PageHeader
        title={vm.t('invitations.title')}
        subtitle={vm.t('invitations.subtitle')}
      />
      <p className="text-muted">{vm.t('common.loading')}</p>
    </div>
  )
}
