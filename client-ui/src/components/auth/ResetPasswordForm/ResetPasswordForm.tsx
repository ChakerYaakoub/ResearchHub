import { Form, Formik } from 'formik'
import { TextInput } from '../../form/TextInput'
import {
  useResetPasswordForm,
  type ResetFormValues,
  type ResetPasswordFormProps,
} from './useResetPasswordForm'

/** Choose a new password after clicking the email reset link. */
export function ResetPasswordForm(props: ResetPasswordFormProps) {
  const vm = useResetPasswordForm(props)

  return (
    <Formik<ResetFormValues>
      initialValues={vm.initialValues}
      validationSchema={vm.validationSchema}
      onSubmit={vm.onSubmit}
    >
      {({ isSubmitting }) => (
        <>
          <p className="text-muted small mb-3">{vm.t('reset.subtitle')}</p>
          <Form noValidate>
            <TextInput
              name="new_password"
              label={vm.t('reset.newPassword')}
              type="password"
              autoComplete="new-password"
            />
            <TextInput
              name="confirm_password"
              label={vm.t('reset.confirmPassword')}
              type="password"
              autoComplete="new-password"
            />
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? vm.t('reset.submitting')
                : vm.t('reset.submit')}
            </button>
          </Form>
          <p className="mt-3 mb-0 small text-muted">
            <button
              type="button"
              className="btn btn-link btn-sm p-0 align-baseline"
              onClick={vm.onSwitchToLogin}
            >
              {vm.t('reset.backToLogin')}
            </button>
          </p>
        </>
      )}
    </Formik>
  )
}
