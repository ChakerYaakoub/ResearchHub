import { Form, Formik } from 'formik'
import { Link } from 'react-router-dom'
import { TextInput } from '../form/TextInput'
import type { AuthFormValues } from './authSchemas'
import { useLoginForm, type LoginFormProps } from './useLoginForm'

/** Formik login form targeting `/api/auth/login/`. */
export function LoginForm(props: LoginFormProps) {
  const vm = useLoginForm(props)

  return (
    <Formik<AuthFormValues>
      initialValues={vm.initialValues}
      validationSchema={vm.validationSchema}
      onSubmit={vm.onSubmit}
    >
      {({ isSubmitting, status }) => (
        <>
          <p className="text-muted small mb-3">{vm.t('login.subtitle')}</p>
          {status ? (
            <div className="alert alert-danger py-2" role="alert">
              {status}
            </div>
          ) : null}
          <Form noValidate>
            <TextInput
              name="email"
              label={vm.t('common.email')}
              type="email"
              autoComplete="email"
            />
            <TextInput
              name="password"
              label={vm.t('common.password')}
              type="password"
              autoComplete="current-password"
            />
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? vm.t('login.submitting') : vm.t('login.submit')}
            </button>
          </Form>
          <p className="mt-3 mb-0 small text-muted">
            {vm.t('login.noAccount')}{' '}
            <Link to="/register" state={{ background: vm.background }}>
              {vm.t('login.registerLink')}
            </Link>
          </p>
        </>
      )}
    </Formik>
  )
}
