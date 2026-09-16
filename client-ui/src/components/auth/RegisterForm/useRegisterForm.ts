import type { FormikHelpers } from 'formik'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../api/client'
import { useAuth } from '../../../auth'
import { registerSchema, type AuthFormValues } from '../authSchemas'

export type RegisterFormProps = {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

/** Register form state and Formik submit. */
export function useRegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const { t } = useTranslation()
  const { register } = useAuth()

  const initialValues: AuthFormValues = { email: '', password: '' }
  const validationSchema = registerSchema(t)

  async function onSubmit(
    values: AuthFormValues,
    helpers: FormikHelpers<AuthFormValues>,
  ) {
    helpers.setStatus(undefined)
    try {
      await register(values.email.trim(), values.password)
      onSuccess()
    } catch (err) {
      helpers.setStatus(
        err instanceof ApiError ? err.message : t('errors.registerFailed'),
      )
    }
  }

  return { t, initialValues, validationSchema, onSubmit, onSwitchToLogin }
}
