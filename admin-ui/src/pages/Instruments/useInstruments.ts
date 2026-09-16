import { useCallback, useEffect, useState } from 'react'
import {
  createInstrument,
  deleteInstrument,
  listAdminInstruments,
  listInstallations,
  patchInstrument,
  type AdminInstallation,
  type AdminInstrument,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export type InstrumentFormValues = {
  installation: string
  code: string
  name: string
  technique: string
  description: string
  status: 'AVAILABLE' | 'UNAVAILABLE'
}

const blank: InstrumentFormValues = {
  installation: '',
  code: '',
  name: '',
  technique: '',
  description: '',
  status: 'AVAILABLE',
}

export function useInstruments() {
  const { access } = useAuth()
  const [items, setItems] = useState<AdminInstrument[]>([])
  const [installations, setInstallations] = useState<AdminInstallation[]>([])
  const [filterInstallation, setFilterInstallation] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<InstrumentFormValues>(blank)
  const [saving, setSaving] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      const [insts, instruments] = await Promise.all([
        listInstallations(access),
        listAdminInstruments(
          access,
          filterInstallation ? Number(filterInstallation) : undefined,
        ),
      ])
      setInstallations(insts)
      setItems(instruments)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [access, filterInstallation])

  useEffect(() => {
    void reload()
  }, [reload])

  function openCreate() {
    setEditingId(null)
    setForm({
      ...blank,
      installation: filterInstallation || '',
    })
    setActionError(null)
    setShowForm(true)
  }

  function openEdit(row: AdminInstrument) {
    setEditingId(row.id)
    setForm({
      installation: String(row.installation),
      code: row.code,
      name: row.name,
      technique: row.technique,
      description: row.description,
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
    if (!access || !form.installation) return
    setSaving(true)
    setActionError(null)
    const body = {
      installation: Number(form.installation),
      code: form.code.trim(),
      name: form.name.trim(),
      technique: form.technique.trim(),
      description: form.description.trim(),
      status: form.status,
    }
    try {
      if (editingId) {
        await patchInstrument(access, editingId, body)
      } else {
        await createInstrument(access, body)
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
      await deleteInstrument(access, pendingDeleteId)
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
    installations,
    filterInstallation,
    setFilterInstallation,
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
