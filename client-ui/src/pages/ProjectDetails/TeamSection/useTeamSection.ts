import type { FormikHelpers } from 'formik'
import type { TFunction } from 'i18next'
import type { Invitation, ProjectMembership } from '../../../types/api'
import type { InviteFormValues } from '../useProjectDetails'

export type TeamSectionProps = {
  t: TFunction
  collaborators: ProjectMembership[]
  projectInvitations: Invitation[]
  isOwner: boolean
  inviteInitial: InviteFormValues
  // Yup schema from parent Formik invite flow
  inviteSchema: unknown
  onInvite: (
    values: InviteFormValues,
    helpers: FormikHelpers<InviteFormValues>,
  ) => void | Promise<void>
  inviteOpen: boolean
  openInvite: () => void
  closeInvite: () => void
  requestCancelInvite: (inv: Invitation) => void
  /** Show a section heading (used when Team sits outside tabs). */
  showTitle?: boolean
}

export function useTeamSection(props: TeamSectionProps) {
  // Accepted invites already appear under Collaborators — omit them here.
  const projectInvitations = props.projectInvitations.filter(
    (inv) => inv.status !== 'ACCEPTED',
  )

  return {
    ...props,
    projectInvitations,
    showTitle: Boolean(props.showTitle),
  }
}
