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
import { AdminListFilters } from '../../components/AdminListFilters'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { useAdminListParams } from '../../hooks/useAdminListParams'

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
  const listParams = useAdminListParams()
  const [items, setItems] = useState<AdminInstrument[]>([])
  const [installations, setInstallations] = useState<AdminInstallation[]>([])
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
        listAdminInstruments(access, {
          installation: listParams.filters.installation,
          status: listParams.filters.status,
          search: listParams.filters.search,
        }),
      ])
      setInstallations(insts)
      setItems(instruments)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [
    access,
    listParams.filters.installation,
    listParams.filters.search,
    listParams.filters.status,
  ])

  useEffect(() => {
    void reload()
  }, [reload])

  function openCreate() {
    setEditingId(null)
    setForm({
      ...blank,
      installation: listParams.installation || '',
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

  const filtersUi =
    !loading && (items.length > 0 || listParams.hasActiveFilters) ? (
    <AdminListFilters
      searchInput={listParams.searchInput}
      onSearchChange={listParams.setSearchInput}
      searchPlaceholder={copy.searchInstruments}
      selects={[
        {
          id: 'filter-installation',
          label: copy.installation,
          value: listParams.installation,
          onChange: listParams.setInstallation,
          options: [
            { value: '', label: copy.filterAll },
            ...installations.map((i) => ({
              value: String(i.id),
              label: i.name,
            })),
          ],
        },
        {
          id: 'instrument-status',
          label: copy.status,
          value: listParams.status,
          onChange: listParams.setStatus,
          options: [
            { value: '', label: copy.filterAll },
            { value: 'AVAILABLE', label: copy.available },
            { value: 'UNAVAILABLE', label: copy.unavailable },
          ],
        },
      ]}
    />
  ) : null

  return {
    copy,
    items,
    installations,
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
    filtersUi,
  }
}
