import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, type Location } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { TextInput } from '../form/TextInput'
import { registerSchema, type AuthFormValues } from './authSchemas'

type RegisterFormProps = {
  onSuccess: () => void
}

/** Formik register form targeting `/api/auth/register/`. */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useTranslation()
  const { register } = useAuth()
  const location = useLocation()
  const background = (location.state as { background?: Location } | null)
    ?.background

  return (
    <Formik<AuthFormValues>
      initialValues={{ email: '', password: '' }}
      validationSchema={registerSchema(t)}
      onSubmit={async (values, helpers) => {
        helpers.setStatus(undefined)
        try {
          await register(values.email.trim(), values.password)
          onSuccess()
        } catch (err) {
          helpers.setStatus(
            err instanceof ApiError
              ? err.message
              : t('errors.registerFailed'),
          )
        }
      }}
    >
      {({ isSubmitting, status }) => (
        <>
          <p className="text-muted small mb-3">{t('register.subtitle')}</p>
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
              autoComplete="new-password"
              helperText={t('register.passwordHint')}
            />
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('register.submitting') : t('register.submit')}
            </button>
          </Form>
          <p className="mt-3 mb-0 small text-muted">
            {t('register.haveAccount')}{' '}
            <Link to="/login" state={{ background }}>
              {t('register.loginLink')}
            </Link>
          </p>
        </>
      )}
    </Formik>
  )
}
