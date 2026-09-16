import type { FormikHelpers } from 'formik'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import { ApiError } from '../../../api/client'
import {
  createExperiment,
  deleteExperiment,
  listExperiments,
  updateExperiment,
} from '../../../api/experiments'
import { useAuth } from '../../../auth'
import type {
  Experiment,
  ExperimentStatus,
  Project,
} from '../../../types/api'

export type ExperimentsSectionProps = {
  projectId: number
  project: Project
  canEdit: boolean
  onProjectChanged: () => void
}

export type ExperimentFormValues = {
  instrument: string
  scheduled_date: string
  status: ExperimentStatus
  notes: string
}

const STATUSES: ExperimentStatus[] = [
  'PLANNED',
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
]

function toLocalInput(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Experiments list + create/edit/delete. */
export function useExperimentsSection({
  projectId,
  canEdit,
  onProjectChanged,
}: ExperimentsSectionProps) {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [items, setItems] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setItems(await listExperiments(access, projectId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [access, projectId, t])

  useEffect(() => {
    void reload()
  }, [reload])

  const blank: ExperimentFormValues = {
    instrument: '',
    scheduled_date: '',
    status: 'PLANNED',
    notes: '',
  }

  const editing = items.find((e) => e.id === editingId) ?? null

  const initialValues: ExperimentFormValues = editing
    ? {
        instrument: editing.instrument,
        scheduled_date: toLocalInput(editing.scheduled_date),
        status: editing.status,
        notes: editing.notes ?? '',
      }
    : blank

  const validationSchema = Yup.object({
    instrument: Yup.string().trim().required(t('experiments.instrumentRequired')),
    scheduled_date: Yup.string().required(t('experiments.dateRequired')),
    status: Yup.mixed<ExperimentStatus>().oneOf(STATUSES).required(),
    notes: Yup.string(),
  })

  function openCreate() {
    setEditingId(null)
    setShowForm(true)
    setActionError(null)
  }

  function openEdit(id: number) {
    setEditingId(id)
    setShowForm(true)
    setActionError(null)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  async function onSave(
    values: ExperimentFormValues,
    helpers: FormikHelpers<ExperimentFormValues>,
  ) {
    if (!access || !canEdit) return
    setActionError(null)
    const body = {
      instrument: values.instrument.trim(),
      scheduled_date: new Date(values.scheduled_date).toISOString(),
      status: values.status,
      notes: values.notes.trim(),
    }
    try {
      if (editingId) {
        await updateExperiment(access, editingId, body)
      } else {
        await createExperiment(access, projectId, body)
        onProjectChanged()
      }
      closeForm()
      await reload()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t('errors.createFailed'),
      )
    } finally {
      helpers.setSubmitting(false)
    }
  }

  async function onDelete(id: number) {
    if (!access || !canEdit) return
    if (!window.confirm(t('experiments.confirmDelete'))) return
    setActionError(null)
    try {
      await deleteExperiment(access, id)
      if (editingId === id) closeForm()
      await reload()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t('errors.requestFailed'),
      )
    }
  }

  return {
    t,
    items,
    loading,
    error,
    actionError,
    canEdit,
    showForm,
    editingId,
    initialValues,
    validationSchema,
    statuses: STATUSES,
    openCreate,
    openEdit,
    closeForm,
    onSave,
    onDelete,
  }
}
