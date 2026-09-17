import { Form, FormikProvider } from 'formik'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { PageHeader } from '../../components/PageHeader'
import { TextInput } from '../../components/form/TextInput'
import { useAccount } from './useAccount'

export function AccountPage() {
  const vm = useAccount()
  const { profileForm: pf, passwordForm: pw } = vm

  return (
    <div className="container py-4">
      <PageHeader
        title={vm.t('account.title')}
        subtitle={vm.t('account.subtitle')}
      />

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="border rounded p-3 bg-white h-100">
            <h2 className="h5 mb-3">{vm.t('account.profileSection')}</h2>
            <FormikProvider value={pf}>
              <Form noValidate>
                <TextInput
                  name="email"
                  label={vm.t('common.email')}
                  type="email"
                  disabled
                  readOnly
                  helperText={vm.t('account.emailHint')}
                />
                <TextInput
                  name="username"
                  label={vm.t('account.username')}
                  type="text"
                  autoComplete="username"
                  disabled={pf.isSubmitting}
                  required
                />
                <TextInput
                  name="first_name"
                  label={vm.t('account.firstName')}
                  type="text"
                  autoComplete="given-name"
                  disabled={pf.isSubmitting}
                />
                <TextInput
                  name="last_name"
                  label={vm.t('account.lastName')}
                  type="text"
                  autoComplete="family-name"
                  disabled={pf.isSubmitting}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pf.isSubmitting}
                >
                  {pf.isSubmitting
                    ? vm.t('account.saving')
                    : vm.t('account.saveProfile')}
                </button>
              </Form>
            </FormikProvider>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="border rounded p-3 bg-white h-100">
            <h2 className="h5 mb-3">{vm.t('account.passwordSection')}</h2>
            <FormikProvider value={pw}>
              <Form noValidate>
                <TextInput
                  name="current_password"
                  label={vm.t('account.currentPassword')}
                  type="password"
                  autoComplete="current-password"
                  disabled={pw.isSubmitting}
                  required
                />
                <TextInput
                  name="new_password"
                  label={vm.t('account.newPassword')}
                  type="password"
                  autoComplete="new-password"
                  disabled={pw.isSubmitting}
                  required
                />
                <TextInput
                  name="confirm_password"
                  label={vm.t('account.confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  disabled={pw.isSubmitting}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pw.isSubmitting}
                >
                  {pw.isSubmitting
                    ? vm.t('account.changingPassword')
                    : vm.t('account.changePassword')}
                </button>
              </Form>
            </FormikProvider>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="border rounded p-3 bg-white h-100">
            <h2 className="h5 mb-3">{vm.t('account.resetEmailSection')}</h2>
            <p className="text-muted small mb-3">
              {vm.t('account.resetEmailHint')}
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={vm.resetSending}
              onClick={vm.openResetConfirm}
            >
              {vm.t('account.sendResetLink')}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={vm.resetConfirmOpen}
        title={vm.t('account.resetEmailTitle')}
        message={vm.t('account.resetEmailConfirm')}
        confirmLabel={vm.t('account.sendResetLink')}
        cancelLabel={vm.t('common.cancel')}
        busy={vm.resetSending}
        busyLabel={vm.t('account.sendingResetLink')}
        onConfirm={() => void vm.confirmSendResetLink()}
        onClose={vm.closeResetConfirm}
      />
    </div>
  )
}
