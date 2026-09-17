import type { FormikHelpers } from 'formik'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import { ApiError } from '../../../api/client'
import {
  createProposal,
  getProposal,
  updateProposal,
} from '../../../api/proposals'
import { useAuth } from '../../../auth'
import { notifyError, notifySuccess } from '../../../notify'
import type { Project, Proposal } from '../../../types/api'

export type ProposalSectionProps = {
  projectId: string
  project: Project
  canEdit: boolean
  onProjectChanged: () => void
  /** Draft prep: show Continue after proposal exists. */
  onContinue?: () => void
}

export type ProposalFormValues = {
  methodology: string
  expected_results: string
}

/**
 * Proposal tab: GET/create/update methodology + expected results.
 * Editable only when canEdit and project is DRAFT or REJECTED (UI gate).
 * Formal submit is on SubmitSection, not here.
 */
export function useProposalSection({
  projectId,
  project,
  canEdit,
  onContinue,
}: ProposalSectionProps) {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const isDraft = project.status === 'DRAFT'
  const isPreparing =
    project.status === 'DRAFT' || project.status === 'REJECTED'
  const canMutate = canEdit && isPreparing

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setProposal(await getProposal(access, projectId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [access, projectId, t])

  useEffect(() => {
    void reload()
  }, [reload])

  const initialValues: ProposalFormValues = {
    methodology: proposal?.methodology ?? '',
    expected_results: proposal?.expected_results ?? '',
  }

  const validationSchema = Yup.object({
    methodology: Yup.string(),
    expected_results: Yup.string(),
  })

  function openForm() {
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
  }

  async function onSave(
    values: ProposalFormValues,
    helpers: FormikHelpers<ProposalFormValues>,
  ) {
    if (!access || !canMutate) return
    const body = {
      methodology: values.methodology.trim(),
      expected_results: values.expected_results.trim(),
    }
    try {
      const saved = proposal
        ? await updateProposal(access, projectId, body)
        : await createProposal(access, projectId, body)
      setProposal(saved)
      notifySuccess(t(proposal ? 'toast.saved' : 'toast.created'))
      setShowForm(false)
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.createFailed'),
      )
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return {
    t,
    proposal,
    loading,
    error,
    canMutate,
    isDraft,
    isPreparing,
    isRejected: project.status === 'REJECTED',
    initialValues,
    validationSchema,
    onSave,
    hasProposal: Boolean(proposal),
    showForm,
    openForm,
    closeForm,
    onContinue,
    showContinue: Boolean(onContinue && canMutate && proposal),
  }
}
