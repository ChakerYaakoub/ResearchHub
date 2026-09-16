import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteProject,
  getProject,
  type AdminProjectDetail,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export function useProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { access } = useAuth()
  const projectId = Number(id)
  const [project, setProject] = useState<AdminProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    if (!access || !Number.isFinite(projectId)) return
    setLoading(true)
    setError(null)
    try {
      setProject(await getProject(access, projectId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setProject(null)
    } finally {
      setLoading(false)
    }
  }, [access, projectId])

  useEffect(() => {
    void reload()
  }, [reload])

  async function confirmDelete() {
    if (!access || !project) return
    setBusy(true)
    setActionError(null)
    try {
      await deleteProject(access, project.id)
      navigate('/projects', { replace: true })
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setBusy(false)
      setConfirmOpen(false)
    }
  }

  return {
    copy,
    project,
    loading,
    error,
    actionError,
    confirmOpen,
    setConfirmOpen,
    busy,
    confirmDelete,
  }
}
