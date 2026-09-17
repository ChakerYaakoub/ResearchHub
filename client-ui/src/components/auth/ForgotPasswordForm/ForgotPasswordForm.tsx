import { Form, Formik } from 'formik'
import { TextInput } from '../../form/TextInput'
import {
  useForgotPasswordForm,
  type ForgotFormValues,
  type ForgotPasswordFormProps,
} from './useForgotPasswordForm'

/** Request a password-reset email. */
export function ForgotPasswordForm(props: ForgotPasswordFormProps) {
  const vm = useForgotPasswordForm(props)

  return (
    <Formik<ForgotFormValues>
      initialValues={vm.initialValues}
      validationSchema={vm.validationSchema}
      onSubmit={vm.onSubmit}
    >
      {({ isSubmitting }) => (
        <>
          <p className="text-muted small mb-3">{vm.t('forgot.subtitle')}</p>
          <Form noValidate>
            <TextInput
              name="email"
              label={vm.t('common.email')}
              type="email"
              autoComplete="email"
            />
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? vm.t('forgot.submitting')
                : vm.t('forgot.submit')}
            </button>
          </Form>
          <p className="mt-3 mb-0 small text-muted">
            <button
              type="button"
              className="btn btn-link btn-sm p-0 align-baseline"
              onClick={vm.onSwitchToLogin}
            >
              {vm.t('forgot.backToLogin')}
            </button>
          </p>
        </>
      )}
    </Formik>
  )
}
