import type { FormikHelpers } from 'formik'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../api/client'
import { useAuth } from '../../../auth'
import { loginSchema, type AuthFormValues } from '../authSchemas'

export type LoginFormProps = {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

/** Login form state and Formik submit. */
export function useLoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const { t } = useTranslation()
  const { login } = useAuth()

  const initialValues: AuthFormValues = { email: '', password: '' }
  const validationSchema = loginSchema(t)

  async function onSubmit(
    values: AuthFormValues,
    helpers: FormikHelpers<AuthFormValues>,
  ) {
    helpers.setStatus(undefined)
    try {
      await login(values.email.trim(), values.password)
      onSuccess()
    } catch (err) {
      helpers.setStatus(
        err instanceof ApiError ? err.message : t('errors.loginFailed'),
      )
    }
  }

  return { t, initialValues, validationSchema, onSubmit, onSwitchToRegister }
}
