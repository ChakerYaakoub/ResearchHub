import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { requestPasswordReset, updateMeRequest } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { notifyError, notifySuccess } from '../../notify'

export type ProfileFormValues = {
  email: string
  username: string
  first_name: string
  last_name: string
}

export type PasswordFormValues = {
  current_password: string
  new_password: string
  confirm_password: string
}

/**
 * `/account`: profile PATCH, password change, optional reset-email confirm.
 */
export function useAccount() {
  const { access, user, setUser } = useAuth()
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [resetSending, setResetSending] = useState(false)

  const profileSchema = Yup.object({
    username: Yup.string().trim().required(copy.usernameRequired),
    first_name: Yup.string().trim(),
    last_name: Yup.string().trim(),
  })

  const passwordSchema = Yup.object({
    current_password: Yup.string().required(copy.passwordRequired),
    new_password: Yup.string()
      .min(8, copy.passwordMin)
      .required(copy.passwordRequired),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password')], copy.passwordMismatch)
      .required(copy.passwordRequired),
  })

  const profileForm = useFormik<ProfileFormValues>({
    enableReinitialize: true,
    initialValues: {
      email: user?.email ?? '',
      username: user?.username ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      if (!access) return
      try {
        const updated = await updateMeRequest(access, {
          username: values.username.trim(),
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
        })
        setUser(updated)
        notifySuccess(copy.profileSaved)
      } catch (err) {
        notifyError(
          err instanceof ApiError ? err.message : copy.requestFailed,
        )
      }
    },
  })

  const passwordForm = useFormik<PasswordFormValues>({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, helpers) => {
      if (!access) return
      try {
        const updated = await updateMeRequest(access, {
          current_password: values.current_password,
          new_password: values.new_password,
        })
        setUser(updated)
        helpers.resetForm()
        notifySuccess(copy.passwordChanged)
      } catch (err) {
        notifyError(
          err instanceof ApiError ? err.message : copy.requestFailed,
        )
      }
    },
  })

  function openResetConfirm() {
    setResetConfirmOpen(true)
  }

  function closeResetConfirm() {
    if (resetSending) return
    setResetConfirmOpen(false)
  }

  async function confirmSendResetLink() {
    const email = user?.email?.trim()
    if (!email) return
    setResetSending(true)
    try {
      await requestPasswordReset(email.toLowerCase())
      notifySuccess(copy.resetEmailSent)
      setResetConfirmOpen(false)
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : copy.resetFailed,
      )
    } finally {
      setResetSending(false)
    }
  }

  return {
    copy,
    role: user?.role ?? '',
    profileForm,
    passwordForm,
    resetConfirmOpen,
    resetSending,
    openResetConfirm,
    closeResetConfirm,
    confirmSendResetLink,
  }
}
