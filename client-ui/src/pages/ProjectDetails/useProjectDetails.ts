import type { FormikHelpers } from 'formik'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { ApiError } from '../../api/client'
import { createProjectInvitation } from '../../api/invitations'
import { getProject, listCollaborators } from '../../api/projects'
import { useAuth } from '../../auth'
import type {
  InvitationRole,
  Project,
  ProjectMembership,
} from '../../types/api'

export type InviteFormValues = {
  email: string
  role: InvitationRole
}

/** Project detail shell: metadata, collaborators, owner invite. */
export function useProjectDetails() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { access, user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [collaborators, setCollaborators] = useState<ProjectMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!access || !id) return
    setLoading(true)
    setError(null)
    try {
      const [proj, members] = await Promise.all([
        getProject(access, id),
        listCollaborators(access, id),
      ])
      setProject(proj)
      setCollaborators(members)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errors.loadFailed'))
      setProject(null)
      setCollaborators([])
    } finally {
      setLoading(false)
    }
  }, [access, id, t])

  useEffect(() => {
    void reload()
  }, [reload])

  const isOwner = Boolean(
    project && user && project.owner === user.id,
  )

  const inviteInitial: InviteFormValues = {
    email: '',
    role: 'VIEWER',
  }

  const inviteSchema = Yup.object({
    email: Yup.string()
      .trim()
      .email(t('validation.emailInvalid'))
      .required(t('validation.emailRequired')),
    role: Yup.mixed<InvitationRole>().oneOf(['EDITOR', 'VIEWER']).required(),
  })

  async function onInvite(
    values: InviteFormValues,
    helpers: FormikHelpers<InviteFormValues>,
  ) {
    if (!access || !id) return
    setInviteError(null)
    setInviteMessage(null)
    try {
      await createProjectInvitation(access, id, {
        email: values.email.trim().toLowerCase(),
        role: values.role,
      })
      setInviteMessage(t('projects.inviteSent'))
      helpers.resetForm()
    } catch (err) {
      setInviteError(
        err instanceof ApiError ? err.message : t('errors.inviteFailed'),
      )
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return {
    t,
    id,
    project,
    collaborators,
    loading,
    error,
    isOwner,
    inviteInitial,
    inviteSchema,
    onInvite,
    inviteMessage,
    inviteError,
  }
}
