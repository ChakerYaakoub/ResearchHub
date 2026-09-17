import type { FormikHelpers } from 'formik'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { ApiError } from '../../api/client'
import {
  cancelProjectInvitation,
  createProjectInvitation,
  listProjectInvitations,
} from '../../api/invitations'
import {
  completeProject,
  deleteProject,
  getProject,
  listCollaborators,
} from '../../api/projects'
import { useAuth } from '../../auth'
import { notifyError, notifySuccess } from '../../notify'
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

export type ProjectConfirmKind = 'delete' | 'complete' | 'cancelInvite'

export type ProjectDetailsSection =
  | 'proposal'
  | 'experiments'
  | 'publications'
  | 'submit'

export type DraftPrepStep = {
  id: ProjectDetailsSection
  labelKey: string
}

export const DRAFT_PREP_STEPS: DraftPrepStep[] = [
  { id: 'proposal', labelKey: 'projects.draftPrep.stepProposal' },
  { id: 'experiments', labelKey: 'projects.draftPrep.stepExperiments' },
  { id: 'publications', labelKey: 'projects.draftPrep.stepPublications' },
  { id: 'submit', labelKey: 'projects.draftPrep.stepSubmit' },
]

const NORMAL_SECTIONS: {
  id: Exclude<ProjectDetailsSection, 'submit'>
  labelKey: string
}[] = [
  { id: 'proposal', labelKey: 'proposal.title' },
  { id: 'experiments', labelKey: 'experiments.title' },
  { id: 'publications', labelKey: 'publications.title' },
]

/**
 * Authenticated `/projects/:id` shell.
 *
 * Loads project + collaborators; owner also loads project invitations.
 * UI membership gates (`canEdit` / `isOwner`) hide actions — backend AuthZ is authoritative.
 * Draft/REJECTED + canEdit shows draft-prep steps including Submit; other statuses use proposal/experiments/publications tabs.
 */
export function useProjectDetails() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { access, user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [collaborators, setCollaborators] = useState<ProjectMembership[]>([])
  const [projectInvitations, setProjectInvitations] = useState<Invitation[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [cancellingInviteId, setCancellingInviteId] = useState<string | null>(
    null,
  )
  const [confirmKind, setConfirmKind] = useState<ProjectConfirmKind | null>(
    null,
  )
  const [pendingInvite, setPendingInvite] = useState<Invitation | null>(null)
  const [activeSection, setActiveSection] =
    useState<ProjectDetailsSection>('proposal')
  const [draftLanded, setDraftLanded] = useState(false)

  const reloadInvitations = useCallback(async () => {
    if (!access || !id) return
    try {
      setProjectInvitations(await listProjectInvitations(access, id))
    } catch {
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
      /* keep current view */
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

  const status = project?.status
  const preparing = Boolean(status && (status === 'DRAFT' || status === 'REJECTED'))
  const showDraftPrep = Boolean(project && preparing && canEdit)

  useEffect(() => {
    if (!project || loading) return
    if (showDraftPrep && !draftLanded) {
      setActiveSection('proposal')
      setDraftLanded(true)
    }
    if (!showDraftPrep && draftLanded) {
      setDraftLanded(false)
    }
  }, [project, loading, showDraftPrep, draftLanded])

  useEffect(() => {
    if (!project) return
    if (!preparing && activeSection === 'submit') {
      setActiveSection('proposal')
    }
  }, [project, preparing, activeSection])

  const canAddPlannedExperiment = Boolean(canEdit && preparing)
  const canAddExecutedExperiment = Boolean(
    canEdit && (status === 'APPROVED' || status === 'IN_PROGRESS'),
  )
  const canAddExistingPublication = Boolean(canEdit && preparing)
  const canAddResultingPublication = Boolean(
    canEdit && (status === 'IN_PROGRESS' || status === 'COMPLETED'),
  )

  const canComplete = Boolean(canEdit && project?.status === 'IN_PROGRESS')

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

  function closeConfirm() {
    if (completing || deleting || cancellingInviteId != null) return
    setConfirmKind(null)
    setPendingInvite(null)
  }

  function requestDelete() {
    setConfirmKind('delete')
  }

  function requestComplete() {
    setConfirmKind('complete')
  }

  function requestCancelInvite(invitation: Invitation) {
    setPendingInvite(invitation)
    setConfirmKind('cancelInvite')
  }

  function openInvite() {
    setInviteOpen(true)
  }

  function closeInvite() {
    setInviteOpen(false)
  }

  async function onInvite(
    values: InviteFormValues,
    helpers: FormikHelpers<InviteFormValues>,
  ) {
    if (!access || !id) return
    try {
      await createProjectInvitation(access, id, {
        email: values.email.trim().toLowerCase(),
        role: values.role,
      })
      notifySuccess(t('toast.inviteSent'))
      helpers.resetForm()
      setInviteOpen(false)
      await reloadInvitations()
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.inviteFailed'),
      )
    } finally {
      helpers.setSubmitting(false)
    }
  }

  async function runCancelInvite() {
    if (!access || !id || !pendingInvite) return
    setCancellingInviteId(pendingInvite.id)
    try {
      await cancelProjectInvitation(access, id, pendingInvite.id)
      notifySuccess(t('toast.inviteCancelled'))
      setConfirmKind(null)
      setPendingInvite(null)
      await reloadInvitations()
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.inviteFailed'),
      )
    } finally {
      setCancellingInviteId(null)
    }
  }

  async function runComplete() {
    if (!access || !id || !canComplete) return
    setCompleting(true)
    try {
      setProject(await completeProject(access, id))
      notifySuccess(t('toast.completed'))
      setConfirmKind(null)
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.requestFailed'),
      )
    } finally {
      setCompleting(false)
    }
  }

  async function runDelete() {
    if (!access || !id || !isOwner) return
    setDeleting(true)
    try {
      await deleteProject(access, id)
      notifySuccess(t('toast.projectDeleted'))
      navigate('/projects', { replace: true })
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.requestFailed'),
      )
      setDeleting(false)
    }
  }

  async function onConfirmAction() {
    if (confirmKind === 'delete') await runDelete()
    else if (confirmKind === 'complete') await runComplete()
    else if (confirmKind === 'cancelInvite') await runCancelInvite()
  }

  const confirmBusy =
    (confirmKind === 'delete' && deleting) ||
    (confirmKind === 'complete' && completing) ||
    (confirmKind === 'cancelInvite' && cancellingInviteId != null)

  const confirmDialog =
    confirmKind === 'delete'
      ? {
          title: t('projects.deleteTitle'),
          message: t('projects.confirmDelete'),
          confirmLabel: t('projects.delete'),
          cancelLabel: t('common.cancel'),
          busyLabel: t('projects.deleting'),
          danger: true,
        }
      : confirmKind === 'complete'
        ? {
            title: t('projects.completeTitle'),
            message: t('projects.confirmComplete'),
            confirmLabel: t('projects.complete'),
            cancelLabel: t('common.cancel'),
            busyLabel: t('projects.completing'),
            danger: false,
          }
        : confirmKind === 'cancelInvite'
          ? {
              title: t('projects.cancelInviteTitle'),
              message: t('projects.confirmCancelInvite'),
              confirmLabel: t('projects.cancelInviteConfirm'),
              cancelLabel: t('projects.cancelInviteKeep'),
              busyLabel: t('projects.cancellingInvite'),
              danger: true,
            }
          : null

  const navSections = showDraftPrep
    ? DRAFT_PREP_STEPS.map((s) => ({
        id: s.id,
        labelKey: s.labelKey,
      }))
    : NORMAL_SECTIONS

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
    showDraftPrep,
    navSections,
    canAddPlannedExperiment,
    canAddExecutedExperiment,
    canAddExistingPublication,
    canAddResultingPublication,
    canComplete,
    inviteInitial,
    inviteSchema,
    onInvite,
    inviteOpen,
    openInvite,
    closeInvite,
    requestCancelInvite,
    requestComplete,
    completing,
    requestDelete,
    deleting,
    refreshProject,
    activeSection,
    setActiveSection,
    goToExperiments: () => setActiveSection('experiments'),
    goToPublications: () => setActiveSection('publications'),
    goToSubmit: () => setActiveSection('submit'),
    confirmOpen: confirmKind != null,
    confirmDialog,
    confirmBusy,
    onConfirmAction,
    closeConfirm,
  }
}
