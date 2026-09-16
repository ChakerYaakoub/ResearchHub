import type { FormikHelpers } from 'formik'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import { ApiError } from '../../../api/client'
import {
  createPublication,
  deletePublication,
  listPublications,
  updatePublication,
} from '../../../api/publications'
import { useAuth } from '../../../auth'
import type { Project, Publication, PublicationKind } from '../../../types/api'

export type PublicationsSectionProps = {
  projectId: number
  project: Project
  canEdit: boolean
  canAddExisting: boolean
  canAddResulting: boolean
  /** Draft prep: Continue to submit. */
  onContinue?: () => void
}

export type PublicationFormValues = {
  title: string
  authors: string
  journal: string
  doi: string
  publication_date: string
  url: string
}

function canMutateKind(
  status: Project['status'],
  kind: PublicationKind,
): boolean {
  if (kind === 'EXISTING') return status === 'DRAFT' || status === 'REJECTED'
  return status === 'IN_PROGRESS' || status === 'COMPLETED'
}

/** Publications list + create/edit/delete (existing vs resulting). */
export function usePublicationsSection({
  projectId,
  project,
  canEdit,
  canAddExisting,
  canAddResulting,
  onContinue,
}: PublicationsSectionProps) {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [items, setItems] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [createKind, setCreateKind] = useState<PublicationKind | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setItems(await listPublications(access, projectId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [access, projectId, t])

  useEffect(() => {
    void reload()
  }, [reload])

  const blank: PublicationFormValues = {
    title: '',
    authors: '',
    journal: '',
    doi: '',
    publication_date: '',
    url: '',
  }

  const editing = items.find((p) => p.id === editingId) ?? null
  const formKind: PublicationKind | null = editing
    ? editing.kind
    : createKind

  const initialValues: PublicationFormValues = editing
    ? {
        title: editing.title,
        authors: editing.authors,
        journal: editing.journal ?? '',
        doi: editing.doi ?? '',
        publication_date: editing.publication_date
          ? editing.publication_date.slice(0, 10)
          : '',
        url: editing.url ?? '',
      }
    : blank

  const validationSchema = Yup.object({
    title: Yup.string().trim().required(t('publications.titleRequired')),
    authors: Yup.string().trim().required(t('publications.authorsRequired')),
    journal: Yup.string(),
    doi: Yup.string(),
    publication_date: Yup.string(),
    url: Yup.string(),
  })

  function openCreate(kind: PublicationKind) {
    setEditingId(null)
    setCreateKind(kind)
    setShowForm(true)
    setActionError(null)
  }

  function openEdit(id: number) {
    setEditingId(id)
    setCreateKind(null)
    setShowForm(true)
    setActionError(null)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setCreateKind(null)
  }

  function canMutateItem(pub: Publication) {
    return canEdit && canMutateKind(project.status, pub.kind)
  }

  async function onSave(
    values: PublicationFormValues,
    helpers: FormikHelpers<PublicationFormValues>,
  ) {
    if (!access || !canEdit || !formKind) return
    setActionError(null)
    const body = {
      kind: formKind,
      title: values.title.trim(),
      authors: values.authors.trim(),
      journal: values.journal.trim(),
      doi: values.doi.trim(),
      publication_date: values.publication_date || null,
      url: values.url.trim(),
    }
    try {
      if (editingId) {
        await updatePublication(access, editingId, body)
      } else {
        await createPublication(access, projectId, body)
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
      await deletePublication(access, pendingDeleteId)
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
    ? t('publications.edit')
    : createKind === 'RESULTING'
      ? t('publications.addResulting')
      : t('publications.addExisting')

  const existingItems = items.filter((p) => p.kind === 'EXISTING')
  const resultingItems = items.filter((p) => p.kind === 'RESULTING')

  const phaseHint = canAddExisting
    ? t('publications.hintExisting')
    : canAddResulting
      ? t('publications.hintResulting')
      : canEdit
        ? t('publications.hintNoAdd')
        : null

  const existingEmpty = canAddExisting
    ? t('publications.emptyExistingEditable')
    : t('publications.emptyExisting')
  const resultingEmpty = canAddResulting
    ? t('publications.emptyResultingEditable')
    : t('publications.emptyResulting')

  const showResultingGroup =
    project.status !== 'DRAFT' && project.status !== 'REJECTED'

  return {
    t,
    items,
    existingItems,
    resultingItems,
    showResultingGroup,
    phaseHint,
    existingEmpty,
    resultingEmpty,
    loading,
    error,
    actionError,
    canAddExisting,
    canAddResulting,
    canMutateItem,
    showForm,
    editingId,
    formKind,
    formTitle,
    initialValues,
    validationSchema,
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
    showContinue: Boolean(onContinue && canAddExisting),
  }
}
