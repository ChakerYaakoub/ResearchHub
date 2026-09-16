import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, type Location } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { TextInput } from '../form/TextInput'
import { loginSchema, type AuthFormValues } from './authSchemas'

type LoginFormProps = {
  onSuccess: () => void
}

/** Formik login form targeting `/api/auth/login/`. */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const location = useLocation()
  const background = (location.state as { background?: Location } | null)
    ?.background

  return (
    <Formik<AuthFormValues>
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema(t)}
      onSubmit={async (values, helpers) => {
        helpers.setStatus(undefined)
        try {
          await login(values.email.trim(), values.password)
          onSuccess()
        } catch (err) {
          helpers.setStatus(
            err instanceof ApiError ? err.message : t('errors.loginFailed'),
          )
        }
      }}
    >
      {({ isSubmitting, status }) => (
        <>
          <p className="text-muted small mb-3">{t('login.subtitle')}</p>
          {status ? (
            <div className="alert alert-danger py-2" role="alert">
              {status}
            </div>
          ) : null}
          <Form noValidate>
            <TextInput
              name="email"
              label={t('common.email')}
              type="email"
              autoComplete="email"
            />
            <TextInput
              name="password"
              label={t('common.password')}
              type="password"
              autoComplete="current-password"
            />
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('login.submitting') : t('login.submit')}
            </button>
          </Form>
          <p className="mt-3 mb-0 small text-muted">
            {t('login.noAccount')}{' '}
            <Link to="/register" state={{ background }}>
              {t('login.registerLink')}
            </Link>
          </p>
        </>
      )}
    </Formik>
  )
}
