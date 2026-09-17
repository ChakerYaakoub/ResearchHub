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
import { notifyError, notifySuccess } from '../../notify'

export function useProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { access } = useAuth()
  const projectId = id ?? ''
  const [project, setProject] = useState<AdminProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    if (!access || !projectId) return
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
    try {
      await deleteProject(access, project.id)
      notifySuccess(copy.projectDeleted)
      navigate('/projects', { replace: true })
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : copy.requestFailed)
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
    confirmOpen,
    setConfirmOpen,
    busy,
    confirmDelete,
  }
}
