import { useCallback, useEffect, useState } from 'react'
import {
  createInstallation,
  deleteInstallation,
  listInstallations,
  patchInstallation,
  type AdminInstallation,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { AdminListFilters } from '../../components/AdminListFilters'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { useAdminListParams } from '../../hooks/useAdminListParams'
import { notifyError, notifySuccess } from '../../notify'

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
  const listParams = useAdminListParams()
  const [items, setItems] = useState<AdminInstallation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      setItems(
        await listInstallations(access, {
          status: listParams.filters.status,
          search: listParams.filters.search,
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [access, listParams.filters.search, listParams.filters.status])

  useEffect(() => {
    void reload()
  }, [reload])

  function openCreate() {
    setEditingId(null)
    setForm(blank)
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
    try {
      if (editingId) {
        await patchInstallation(access, editingId, form)
      } else {
        await createInstallation(access, form)
      }
      notifySuccess(copy.saved)
      closeForm()
      await reload()
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(id: number) {
    setPendingDeleteId(id)
  }

  async function confirmDelete() {
    if (!access || pendingDeleteId == null) return
    setDeleting(true)
    try {
      await deleteInstallation(access, pendingDeleteId)
      setPendingDeleteId(null)
      notifySuccess(copy.deleted)
      await reload()
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setDeleting(false)
    }
  }

  const filtersUi =
    !loading && (items.length > 0 || listParams.hasActiveFilters) ? (
    <AdminListFilters
      searchInput={listParams.searchInput}
      onSearchChange={listParams.setSearchInput}
      searchPlaceholder={copy.searchInstallations}
      selects={[
        {
          id: 'installation-status',
          label: copy.status,
          value: listParams.status,
          onChange: listParams.setStatus,
          options: [
            { value: '', label: copy.filterAll },
            { value: 'ACTIVE', label: copy.filterActive },
            { value: 'INACTIVE', label: copy.filterInactive },
          ],
        },
      ]}
    />
  ) : null

  return {
    copy,
    items,
    loading,
    error,
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
