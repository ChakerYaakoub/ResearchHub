import type { FormikHelpers } from 'formik'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import { ApiError } from '../../../api/client'
import {
  createExperiment,
  deleteExperiment,
  listExperiments,
  updateExperiment,
} from '../../../api/experiments'
import { listInstallations, listInstruments } from '../../../api/facilities'
import { useAuth } from '../../../auth'
import type {
  Experiment,
  ExperimentKind,
  ExperimentStatus,
  Installation,
  Instrument,
  Project,
} from '../../../types/api'

export type ExperimentsSectionProps = {
  projectId: number
  project: Project
  canEdit: boolean
  canAddPlanned: boolean
  canAddExecuted: boolean
  onProjectChanged: () => void
  /** Draft prep: Continue to publications. */
  onContinue?: () => void
}

export type ExperimentFormValues = {
  installation_id: string
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

function canMutateKind(
  status: Project['status'],
  kind: ExperimentKind,
): boolean {
  if (kind === 'PLANNED') return status === 'DRAFT' || status === 'REJECTED'
  return status === 'APPROVED' || status === 'IN_PROGRESS'
}

/** Experiments list + create/edit/delete (planned vs executed). */
export function useExperimentsSection({
  projectId,
  project,
  canEdit,
  canAddPlanned,
  canAddExecuted,
  onProjectChanged,
  onContinue,
}: ExperimentsSectionProps) {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [items, setItems] = useState<Experiment[]>([])
  const [installations, setInstallations] = useState<Installation[]>([])
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [createKind, setCreateKind] = useState<ExperimentKind | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formInstallationId, setFormInstallationId] = useState('')

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      const [exps, insts, allInstruments] = await Promise.all([
        listExperiments(access, projectId),
        listInstallations(access),
        listInstruments(access),
      ])
      setItems(exps)
      setInstallations(insts)
      setInstruments(allInstruments)
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
    installation_id: '',
    instrument: '',
    scheduled_date: '',
    status: 'PLANNED',
    notes: '',
  }

  const editing = items.find((e) => e.id === editingId) ?? null
  const formKind: ExperimentKind | null = editing
    ? editing.kind
    : createKind

  const initialValues: ExperimentFormValues = editing
    ? {
        installation_id: String(editing.installation_id),
        instrument: String(editing.instrument),
        scheduled_date: toLocalInput(editing.scheduled_date),
        status: editing.status,
        notes: editing.notes ?? '',
      }
    : blank

  const validationSchema = Yup.object({
    installation_id: Yup.string().required(t('experiments.installationRequired')),
    instrument: Yup.string().required(t('experiments.instrumentRequired')),
    scheduled_date: Yup.string().required(t('experiments.dateRequired')),
    status: Yup.mixed<ExperimentStatus>().oneOf(STATUSES).required(),
    notes: Yup.string(),
  })

  const instrumentsForForm = useMemo(() => {
    const installationId = Number(formInstallationId)
    if (!installationId) return []
    return instruments.filter((i) => i.installation === installationId)
  }, [instruments, formInstallationId])

  function openCreate(kind: ExperimentKind) {
    setEditingId(null)
    setCreateKind(kind)
    setFormInstallationId('')
    setShowForm(true)
    setActionError(null)
  }

  function openEdit(id: number) {
    const exp = items.find((e) => e.id === id)
    setEditingId(id)
    setCreateKind(null)
    setFormInstallationId(exp ? String(exp.installation_id) : '')
    setShowForm(true)
    setActionError(null)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setCreateKind(null)
    setFormInstallationId('')
  }

  function canMutateItem(exp: Experiment) {
    return canEdit && canMutateKind(project.status, exp.kind)
  }

  async function onSave(
    values: ExperimentFormValues,
    helpers: FormikHelpers<ExperimentFormValues>,
  ) {
    if (!access || !canEdit || !formKind) return
    setActionError(null)
    const body = {
      kind: formKind,
      instrument: Number(values.instrument),
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

  function requestDelete(id: number) {
    setActionError(null)
    setPendingDeleteId(id)
  }

  function closeDeleteConfirm() {
    if (deleting) return
    setPendingDeleteId(null)
  }

  async function confirmDelete() {
    if (!access || !canEdit || pendingDeleteId == null) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteExperiment(access, pendingDeleteId)
      if (editingId === pendingDeleteId) closeForm()
      setPendingDeleteId(null)
      await reload()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t('errors.requestFailed'),
      )
    } finally {
      setDeleting(false)
    }
  }

  const formTitle = editingId
    ? t('experiments.edit')
    : createKind === 'EXECUTED'
      ? t('experiments.addExecuted')
      : t('experiments.addPlanned')

  const plannedItems = items.filter((e) => e.kind === 'PLANNED')
  const executedItems = items.filter((e) => e.kind === 'EXECUTED')

  const phaseHint = canAddPlanned
    ? t('experiments.hintPlanned')
    : canAddExecuted
      ? t('experiments.hintExecuted')
      : canEdit
        ? t('experiments.hintNoAdd')
        : null

  const plannedEmpty = canAddPlanned
    ? t('experiments.emptyPlannedEditable')
    : t('experiments.emptyPlanned')
  const executedEmpty = canAddExecuted
    ? t('experiments.emptyExecutedEditable')
    : t('experiments.emptyExecuted')

  const showExecutedGroup =
    project.status !== 'DRAFT' && project.status !== 'REJECTED'

  return {
    t,
    items,
    plannedItems,
    executedItems,
    showExecutedGroup,
    phaseHint,
    plannedEmpty,
    executedEmpty,
    installations,
    instrumentsForForm,
    formInstallationId,
    setFormInstallationId,
    loading,
    error,
    actionError,
    canAddPlanned,
    canAddExecuted,
    canMutateItem,
    showForm,
    editingId,
    formKind,
    formTitle,
    initialValues,
    validationSchema,
    statuses: STATUSES,
    openCreate,
    openEdit,
    closeForm,
    onSave,
    requestDelete,
    pendingDeleteId,
    deleting,
    confirmDelete,
    closeDeleteConfirm,
    onContinue,
    showContinue: Boolean(onContinue && canAddPlanned),
  }
}
