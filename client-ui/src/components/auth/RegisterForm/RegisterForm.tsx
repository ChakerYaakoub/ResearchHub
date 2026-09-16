import { Form, Formik } from 'formik'
import { TextInput } from '../../form/TextInput'
import type { AuthFormValues } from '../authSchemas'
import { useRegisterForm, type RegisterFormProps } from './useRegisterForm'

/** Formik register form targeting `/api/auth/register/`. */
export function RegisterForm(props: RegisterFormProps) {
  const vm = useRegisterForm(props)

  return (
    <Formik<AuthFormValues>
      initialValues={vm.initialValues}
      validationSchema={vm.validationSchema}
      onSubmit={vm.onSubmit}
    >
      {({ isSubmitting, status }) => (
        <>
          <p className="text-muted small mb-3">{vm.t('register.subtitle')}</p>
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
              autoComplete="new-password"
              helperText={vm.t('register.passwordHint')}
            />
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? vm.t('register.submitting')
                : vm.t('register.submit')}
            </button>
          </Form>
          <p className="mt-3 mb-0 small text-muted">
            {vm.t('register.haveAccount')}{' '}
            <button
              type="button"
              className="btn btn-link btn-sm p-0 align-baseline"
              onClick={vm.onSwitchToLogin}
            >
              {vm.t('register.loginLink')}
            </button>
          </p>
        </>
      )}
    </Formik>
  )
}
