import { useCallback, useEffect, useState } from 'react'
import {
  createInstallation,
  deleteInstallation,
  listInstallations,
  patchInstallation,
  type AdminInstallation,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export type InstallationFormValues = {
  name: string
  description: string
  location: string
  status: 'ACTIVE' | 'INACTIVE'
}

const blank: InstallationFormValues = {
  name: '',
  description: '',
  location: '',
  status: 'ACTIVE',
}

export function useInstallations() {
  const { access } = useAuth()
  const [items, setItems] = useState<AdminInstallation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<InstallationFormValues>(blank)
  const [saving, setSaving] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setItems(await listInstallations(access))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [access])

  useEffect(() => {
    void reload()
  }, [reload])

  function openCreate() {
    setEditingId(null)
    setForm(blank)
    setActionError(null)
    setShowForm(true)
  }

  function openEdit(row: AdminInstallation) {
    setEditingId(row.id)
    setForm({
      name: row.name,
      description: row.description,
      location: row.location,
      status: row.status,
    })
    setActionError(null)
    setShowForm(true)
  }

  function closeForm() {
    if (saving) return
    setShowForm(false)
    setEditingId(null)
  }

  async function onSave() {
    if (!access) return
    setSaving(true)
    setActionError(null)
    try {
      if (editingId) {
        await patchInstallation(access, editingId, form)
      } else {
        await createInstallation(access, form)
      }
      closeForm()
      await reload()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(id: number) {
    setPendingDeleteId(id)
    setActionError(null)
  }

  async function confirmDelete() {
    if (!access || pendingDeleteId == null) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteInstallation(access, pendingDeleteId)
      setPendingDeleteId(null)
      await reload()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setDeleting(false)
    }
  }

  return {
    copy,
    items,
    loading,
    error,
    actionError,
    showForm,
    editingId,
    form,
    setForm,
    saving,
    openCreate,
    openEdit,
    closeForm,
    onSave,
    pendingDeleteId,
    deleting,
    requestDelete,
    confirmDelete,
    closeDelete: () => {
      if (!deleting) setPendingDeleteId(null)
    },
  }
}
