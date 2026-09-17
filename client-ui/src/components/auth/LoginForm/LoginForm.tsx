import { Form, Formik } from 'formik'
import { TextInput } from '../../form/TextInput'
import { HoneypotField } from '../HoneypotField'
import type { AuthFormValues } from '../authSchemas'
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
      {({ isSubmitting }) => (
        <>
          <p className="text-muted small mb-3">{vm.t('login.subtitle')}</p>
          <Form noValidate>
            <HoneypotField />
            <TextInput
              name="email"
              label={vm.t('common.email')}
              type="email"
              autoComplete="email"
              required
            />
            <TextInput
              name="password"
              label={vm.t('common.password')}
              type="password"
              autoComplete="current-password"
              required
            />
            <div className="mb-3 text-end">
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={vm.onSwitchToForgot}
              >
                {vm.t('login.forgotPassword')}
              </button>
            </div>
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
            <button
              type="button"
              className="btn btn-link btn-sm p-0 align-baseline"
              onClick={vm.onSwitchToRegister}
            >
              {vm.t('login.registerLink')}
            </button>
          </p>
        </>
      )}
    </Formik>
  )
}
