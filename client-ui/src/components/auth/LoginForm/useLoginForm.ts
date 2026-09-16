import type { FormikHelpers } from 'formik'
import { useTranslation } from 'react-i18next'
import { useLocation, type Location } from 'react-router-dom'
import { ApiError } from '../../../api/client'
import { useAuth } from '../../../auth'
import { loginSchema, type AuthFormValues } from '../authSchemas'

export type LoginFormProps = {
  onSuccess: () => void
}

/** Login form state: auth, background link, Formik submit. */
export function useLoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const location = useLocation()
  const background = (location.state as { background?: Location } | null)
    ?.background

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

  return { t, background, initialValues, validationSchema, onSubmit }
}
