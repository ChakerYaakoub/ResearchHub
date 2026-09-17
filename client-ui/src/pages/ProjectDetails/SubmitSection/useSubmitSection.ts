import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../api/client'
import { listExperiments } from '../../../api/experiments'
import { getProposal, submitProposal } from '../../../api/proposals'
import { listPublications } from '../../../api/publications'
import { useAuth } from '../../../auth'
import { notifyError, notifySuccess } from '../../../notify'
import type { Project, Proposal } from '../../../types/api'

export type SubmitSectionProps = {
  projectId: number
  project: Project
  canEdit: boolean
  onProjectChanged: () => void
}

/** Draft submit step: checklist, freeze warning, confirm + submit. */
export function useSubmitSection({
  projectId,
  project,
  canEdit,
  onProjectChanged,
}: SubmitSectionProps) {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [plannedCount, setPlannedCount] = useState(0)
  const [existingCount, setExistingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isPreparing =
    project.status === 'DRAFT' || project.status === 'REJECTED'
  const canSubmit = Boolean(canEdit && isPreparing && proposal)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      const [prop, experiments, publications] = await Promise.all([
        getProposal(access, projectId),
        listExperiments(access, projectId),
        listPublications(access, projectId),
      ])
      setProposal(prop)
      setPlannedCount(experiments.filter((e) => e.kind === 'PLANNED').length)
      setExistingCount(publications.filter((p) => p.kind === 'EXISTING').length)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [access, projectId, t])

  useEffect(() => {
    void reload()
  }, [reload])

  function openConfirm() {
    if (!canSubmit) return
    setConfirmOpen(true)
  }

  function closeConfirm() {
    if (submitting) return
    setConfirmOpen(false)
  }

  async function onConfirmSubmit() {
    if (!access || !canSubmit) return
    setSubmitting(true)
    try {
      setProposal(await submitProposal(access, projectId))
      notifySuccess(t('toast.submitted'))
      setConfirmOpen(false)
      onProjectChanged()
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.requestFailed'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return {
    t,
    loading,
    error,
    hasProposal: Boolean(proposal),
    plannedCount,
    existingCount,
    canSubmit,
    isPreparing,
    submitting,
    confirmOpen,
    openConfirm,
    closeConfirm,
    onConfirmSubmit,
  }
}
