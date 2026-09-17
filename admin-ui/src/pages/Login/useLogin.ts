import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { notifyError } from '../../notify'

export type LoginFormValues = {
  email: string
  password: string
}

export function useLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const initialValues: LoginFormValues = { email: '', password: '' }

  const validationSchema = Yup.object({
    email: Yup.string()
      .trim()
      .email(copy.emailInvalid)
      .required(copy.emailRequired),
    password: Yup.string()
      .min(8, copy.passwordMin)
      .required(copy.passwordRequired),
  })

  async function onSubmit(
    values: LoginFormValues,
    helpers: { setSubmitting: (v: boolean) => void },
  ) {
    try {
      await login(values.email.trim().toLowerCase(), values.password)
      navigate('/', { replace: true })
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : copy.loginFailed)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return {
    copy,
    isAuthenticated,
    initialValues,
    validationSchema,
    onSubmit,
  }
}
