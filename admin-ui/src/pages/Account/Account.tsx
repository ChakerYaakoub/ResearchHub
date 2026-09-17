import { Form, FormikProvider } from 'formik'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PasswordField } from '../../components/PasswordField'
import { TextInput } from '../../components/form/TextInput'
import { useAccount } from './useAccount'

export function AccountPage() {
  const vm = useAccount()
  const { profileForm: pf, passwordForm: pw } = vm

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="mb-4">
        <h1 className="h3 mb-1">{vm.copy.accountTitle}</h1>
        <p className="text-muted small mb-0">{vm.copy.accountSubtitle}</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="border rounded p-3 bg-white h-100">
            <h2 className="h5 mb-3">{vm.copy.profileSection}</h2>
            <FormikProvider value={pf}>
              <Form noValidate>
                <TextInput
                  name="email"
                  label={vm.copy.email}
                  type="email"
                  disabled
                  readOnly
                  helperText={vm.copy.emailHint}
                />
                <TextInput
                  name="username"
                  label={vm.copy.username}
                  type="text"
                  autoComplete="username"
                  disabled={pf.isSubmitting}
                  required
                />
                <TextInput
                  name="first_name"
                  label={vm.copy.firstName}
                  type="text"
                  autoComplete="given-name"
                  disabled={pf.isSubmitting}
                />
                <TextInput
                  name="last_name"
                  label={vm.copy.lastName}
                  type="text"
                  autoComplete="family-name"
                  disabled={pf.isSubmitting}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pf.isSubmitting}
                >
                  {pf.isSubmitting ? vm.copy.saving : vm.copy.saveProfile}
                </button>
              </Form>
            </FormikProvider>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="border rounded p-3 bg-white h-100">
            <h2 className="h5 mb-3">{vm.copy.passwordSection}</h2>
            <form onSubmit={pw.handleSubmit} noValidate>
              <PasswordField
                id="account_current_password"
                name="current_password"
                label={vm.copy.currentPassword}
                value={pw.values.current_password}
                onChange={pw.handleChange}
                onBlur={pw.handleBlur}
                autoComplete="current-password"
                disabled={pw.isSubmitting}
                required
                invalid={Boolean(
                  pw.touched.current_password && pw.errors.current_password,
                )}
                error={
                  pw.touched.current_password && pw.errors.current_password
                    ? pw.errors.current_password
                    : undefined
                }
              />
              <PasswordField
                id="account_new_password"
                name="new_password"
                label={vm.copy.newPassword}
                value={pw.values.new_password}
                onChange={pw.handleChange}
                onBlur={pw.handleBlur}
                autoComplete="new-password"
                disabled={pw.isSubmitting}
                required
                invalid={Boolean(
                  pw.touched.new_password && pw.errors.new_password,
                )}
                error={
                  pw.touched.new_password && pw.errors.new_password
                    ? pw.errors.new_password
                    : undefined
                }
              />
              <PasswordField
                id="account_confirm_password"
                name="confirm_password"
                label={vm.copy.confirmPassword}
                value={pw.values.confirm_password}
                onChange={pw.handleChange}
                onBlur={pw.handleBlur}
                autoComplete="new-password"
                disabled={pw.isSubmitting}
                required
                invalid={Boolean(
                  pw.touched.confirm_password && pw.errors.confirm_password,
                )}
                error={
                  pw.touched.confirm_password && pw.errors.confirm_password
                    ? pw.errors.confirm_password
                    : undefined
                }
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pw.isSubmitting}
              >
                {pw.isSubmitting
                  ? vm.copy.changingPassword
                  : vm.copy.changePassword}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="border rounded p-3 bg-white h-100">
            <h2 className="h5 mb-3">{vm.copy.resetEmailSection}</h2>
            <p className="text-muted small mb-3">{vm.copy.resetEmailHint}</p>
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={vm.resetSending}
              onClick={vm.openResetConfirm}
            >
              {vm.copy.sendResetLink}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={vm.resetConfirmOpen}
        title={vm.copy.resetEmailTitle}
        message={vm.copy.resetEmailConfirm}
        confirmLabel={vm.copy.sendResetLink}
        cancelLabel={vm.copy.cancel}
        busy={vm.resetSending}
        busyLabel={vm.copy.sendingResetLink}
        onConfirm={() => void vm.confirmSendResetLink()}
        onClose={vm.closeResetConfirm}
      />
    </div>
  )
}
