import type { FormikHelpers } from 'formik'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../api/client'
import { requestPasswordReset } from '../../../auth/authApi'
import { notifyError, notifySuccess } from '../../../notify'
import * as Yup from 'yup'

export type ForgotPasswordFormProps = {
  onSwitchToLogin: () => void
}

export type ForgotFormValues = {
  email: string
}

/** Forgot-password form: request reset email. */
export function useForgotPasswordForm({
  onSwitchToLogin,
}: ForgotPasswordFormProps) {
  const { t } = useTranslation()

  const initialValues: ForgotFormValues = { email: '' }
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('validation.emailInvalid'))
      .required(t('validation.emailRequired')),
  })

  async function onSubmit(
    values: ForgotFormValues,
    helpers: FormikHelpers<ForgotFormValues>,
  ) {
    try {
      await requestPasswordReset(values.email.trim().toLowerCase())
      notifySuccess(t('toast.resetEmailSent'))
      helpers.resetForm()
      onSwitchToLogin()
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
