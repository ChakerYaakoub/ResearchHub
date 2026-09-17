import type { FormikHelpers } from 'formik'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import { ApiError } from '../../../api/client'
import { confirmPasswordReset } from '../../../auth/authApi'
import {
  clearResetCredentials,
  getResetCredentials,
} from '../../../auth/resetTokenStorage'
import { notifyError, notifySuccess } from '../../../notify'

export type ResetPasswordFormProps = {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export type ResetFormValues = {
  new_password: string
  confirm_password: string
}

/** Set a new password using uid/token from the email deep link. */
export function useResetPasswordForm({
  onSuccess,
  onSwitchToLogin,
}: ResetPasswordFormProps) {
  const { t } = useTranslation()

  const initialValues: ResetFormValues = {
    new_password: '',
    confirm_password: '',
  }
  const validationSchema = Yup.object({
    new_password: Yup.string()
      .min(8, t('validation.passwordMin'))
      .required(t('validation.passwordRequired')),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password')], t('account.passwordMismatch'))
      .required(t('validation.passwordRequired')),
  })

  async function onSubmit(
    values: ResetFormValues,
    helpers: FormikHelpers<ResetFormValues>,
  ) {
    const creds = getResetCredentials()
    if (!creds) {
      notifyError(t('errors.resetLinkInvalid'))
      helpers.setSubmitting(false)
      return
    }
    try {
      await confirmPasswordReset({
        uid: creds.uid,
        token: creds.token,
        new_password: values.new_password,
      })
      clearResetCredentials()
      notifySuccess(t('toast.passwordReset'))
      helpers.resetForm()
      onSuccess()
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.resetFailed'),
      )
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return {
    t,
    initialValues,
    validationSchema,
    onSubmit,
    onSwitchToLogin,
  }
}
