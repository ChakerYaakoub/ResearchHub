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
import type { Project, Publication } from '../../../types/api'

export type PublicationsSectionProps = {
  projectId: number
  project: Project
  canEdit: boolean
}

export type PublicationFormValues = {
  title: string
  authors: string
  journal: string
  doi: string
  publication_date: string
  url: string
}

/** Publications list + create/edit/delete. */
export function usePublicationsSection({
  projectId,
  canEdit,
}: PublicationsSectionProps) {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [items, setItems] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
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
    values: PublicationFormValues,
    helpers: FormikHelpers<PublicationFormValues>,
  ) {
    if (!access || !canEdit) return
    setActionError(null)
    const body = {
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
    openCreate,
    openEdit,
    closeForm,
    onSave,
    requestDelete,
    pendingDeleteId,
    deleting,
    confirmDelete,
    closeDeleteConfirm,
  }
}
