import type { FormikHelpers } from 'formik'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../../api/client'
import { useAuth } from '../../../auth'
import { notifyError } from '../../../notify'
import { registerSchema, type AuthFormValues } from '../authSchemas'

export type RegisterFormProps = {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

/**
 * Register Formik wiring: Yup schema + AuthContext.register (honeypot `company`).
 * Same UX validation caveats as login — backend is authoritative.
 */
export function useRegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const { t } = useTranslation()
  const { register } = useAuth()

  const initialValues: AuthFormValues = { email: '', password: '', company: '' }
  const validationSchema = registerSchema(t)

  async function onSubmit(
    values: AuthFormValues,
    helpers: FormikHelpers<AuthFormValues>,
  ) {
    try {
      await register(values.email.trim(), values.password, values.company)
      onSuccess()
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.registerFailed'),
      )
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return { t, initialValues, validationSchema, onSubmit, onSwitchToLogin }
}
