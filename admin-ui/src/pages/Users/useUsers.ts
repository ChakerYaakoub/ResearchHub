import { useCallback, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  createAdmin,
  listUsers,
  patchUser,
  type AdminUser,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

const createSchema = Yup.object({
  email: Yup.string()
    .email(copy.emailInvalid)
    .required(copy.emailRequired),
  password: Yup.string()
    .min(8, copy.passwordMin)
    .required(copy.passwordRequired),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password')], copy.passwordMismatch)
    .required(copy.passwordRequired),
  username: Yup.string().trim(),
})

export function useUsers() {
  const { access, user: me, isSuperAdmin } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setUsers(await listUsers(access))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [access])

  useEffect(() => {
    void reload()
  }, [reload])

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      username: '',
    },
    validationSchema: createSchema,
    onSubmit: async (values, helpers) => {
      if (!access) return
      setCreating(true)
      setActionError(null)
      setSuccess(null)
      try {
        await createAdmin(access, {
          email: values.email.trim(),
          password: values.password,
          username: values.username.trim() || undefined,
        })
        helpers.resetForm()
        setCreateOpen(false)
        setSuccess(copy.createAdminSuccess)
        await reload()
      } catch (err) {
        setActionError(
          err instanceof ApiError ? err.message : copy.requestFailed,
        )
      } finally {
        setCreating(false)
      }
    },
  })

  async function setActive(id: number, is_active: boolean) {
    if (!access) return
    setBusyId(id)
    setActionError(null)
    setSuccess(null)
    try {
      const updated = await patchUser(access, id, { is_active })
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setBusyId(null)
    }
  }

  function openCreate() {
    setActionError(null)
    setSuccess(null)
    formik.resetForm()
    setCreateOpen(true)
  }

  function closeCreate() {
    if (creating) return
    setCreateOpen(false)
  }

  return {
    copy,
    users,
    loading,
    error,
    actionError,
    success,
    busyId,
    meId: me?.id ?? null,
    isSuperAdmin,
    setActive,
    createOpen,
    openCreate,
    closeCreate,
    formik,
    creating,
  }
}
