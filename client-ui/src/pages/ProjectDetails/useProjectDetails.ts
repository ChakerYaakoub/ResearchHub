import type { FormikHelpers } from 'formik'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { ApiError } from '../../api/client'
import {
  cancelProjectInvitation,
  createProjectInvitation,
  listProjectInvitations,
} from '../../api/invitations'
import {
  completeProject,
  getProject,
  listCollaborators,
} from '../../api/projects'
import { useAuth } from '../../auth'
import type {
  Invitation,
  InvitationRole,
  Project,
  ProjectMembership,
} from '../../types/api'

export type InviteFormValues = {
  email: string
  role: InvitationRole
}

/** Project detail shell: metadata, collaborators, owner invite, complete. */
export function useProjectDetails() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { access, user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [collaborators, setCollaborators] = useState<ProjectMembership[]>([])
  const [projectInvitations, setProjectInvitations] = useState<Invitation[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [cancellingInviteId, setCancellingInviteId] = useState<number | null>(
    null,
  )

  const reloadInvitations = useCallback(async () => {
    if (!access || !id) return
    try {
      setProjectInvitations(await listProjectInvitations(access, id))
    } catch {
      /* owner-only endpoint; non-owners ignore */
      setProjectInvitations([])
    }
  }, [access, id])

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
      const owner = Boolean(user && proj.owner === user.id)
      if (owner) {
        try {
          setProjectInvitations(await listProjectInvitations(access, id))
        } catch {
          setProjectInvitations([])
        }
      } else {
        setProjectInvitations([])
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errors.loadFailed'))
      setProject(null)
      setCollaborators([])
      setProjectInvitations([])
    } finally {
      setLoading(false)
    }
  }, [access, id, t, user])

  const refreshProject = useCallback(async () => {
    if (!access || !id) return
    try {
      const [proj, members] = await Promise.all([
        getProject(access, id),
        listCollaborators(access, id),
      ])
      setProject(proj)
      setCollaborators(members)
    } catch {
      /* keep current view; sections show their own errors */
    }
  }, [access, id])

  useEffect(() => {
    void reload()
  }, [reload])

  const isOwner = Boolean(project && user && project.owner === user.id)

  const membership = collaborators.find((m) => user && m.user === user.id)
  const canEdit = Boolean(
    isOwner ||
      membership?.role === 'OWNER' ||
      membership?.role === 'EDITOR',
  )

  const canComplete = Boolean(
    canEdit && project?.status === 'IN_PROGRESS',
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
      await reloadInvitations()
    } catch (err) {
      setInviteError(
        err instanceof ApiError ? err.message : t('errors.inviteFailed'),
      )
    } finally {
      helpers.setSubmitting(false)
    }
  }

  async function onCancelInvite(invitation: Invitation) {
    if (!access || !id) return
    if (!window.confirm(t('projects.confirmCancelInvite'))) return
    setCancellingInviteId(invitation.id)
    setInviteError(null)
    try {
      await cancelProjectInvitation(access, id, invitation.id)
      await reloadInvitations()
    } catch (err) {
      setInviteError(
        err instanceof ApiError ? err.message : t('errors.inviteFailed'),
      )
    } finally {
      setCancellingInviteId(null)
    }
  }

  async function onComplete() {
    if (!access || !id || !canComplete) return
    if (!window.confirm(t('projects.confirmComplete'))) return
    setCompleting(true)
    setCompleteError(null)
    try {
      setProject(await completeProject(access, id))
    } catch (err) {
      setCompleteError(
        err instanceof ApiError ? err.message : t('errors.requestFailed'),
      )
    } finally {
      setCompleting(false)
    }
  }

  return {
    t,
    id,
    project,
    collaborators,
    projectInvitations,
    loading,
    error,
    isOwner,
    canEdit,
    canComplete,
    inviteInitial,
    inviteSchema,
    onInvite,
    onCancelInvite,
    cancellingInviteId,
    inviteMessage,
    inviteError,
    onComplete,
    completing,
    completeError,
    refreshProject,
  }
}
