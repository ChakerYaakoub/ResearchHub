import { PageHeader } from '../../components/PageHeader'
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
          <h2 className="h5 mb-3">{vm.t('account.profileSection')}</h2>
          <form onSubmit={pf.handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_email">
                {vm.t('common.email')}
              </label>
              <input
                id="account_email"
                type="email"
                className="form-control"
                value={pf.values.email}
                disabled
                readOnly
              />
              <div className="form-text">{vm.t('account.emailHint')}</div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_username">
                {vm.t('account.username')}
              </label>
              <input
                id="account_username"
                name="username"
                type="text"
                className={`form-control${
                  pf.touched.username && pf.errors.username ? ' is-invalid' : ''
                }`}
                value={pf.values.username}
                onChange={pf.handleChange}
                onBlur={pf.handleBlur}
                disabled={pf.isSubmitting}
                autoComplete="username"
              />
              {pf.touched.username && pf.errors.username ? (
                <div className="invalid-feedback">{pf.errors.username}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_first_name">
                {vm.t('account.firstName')}
              </label>
              <input
                id="account_first_name"
                name="first_name"
                type="text"
                className="form-control"
                value={pf.values.first_name}
                onChange={pf.handleChange}
                onBlur={pf.handleBlur}
                disabled={pf.isSubmitting}
                autoComplete="given-name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_last_name">
                {vm.t('account.lastName')}
              </label>
              <input
                id="account_last_name"
                name="last_name"
                type="text"
                className="form-control"
                value={pf.values.last_name}
                onChange={pf.handleChange}
                onBlur={pf.handleBlur}
                disabled={pf.isSubmitting}
                autoComplete="family-name"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={pf.isSubmitting}
            >
              {pf.isSubmitting
                ? vm.t('account.saving')
                : vm.t('account.saveProfile')}
            </button>
          </form>
        </div>

        <div className="col-12 col-lg-6">
          <h2 className="h5 mb-3">{vm.t('account.passwordSection')}</h2>
          <form onSubmit={pw.handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_current_password">
                {vm.t('account.currentPassword')}
              </label>
              <input
                id="account_current_password"
                name="current_password"
                type="password"
                className={`form-control${
                  pw.touched.current_password && pw.errors.current_password
                    ? ' is-invalid'
                    : ''
                }`}
                value={pw.values.current_password}
                onChange={pw.handleChange}
                onBlur={pw.handleBlur}
                disabled={pw.isSubmitting}
                autoComplete="current-password"
              />
              {pw.touched.current_password && pw.errors.current_password ? (
                <div className="invalid-feedback">
                  {pw.errors.current_password}
                </div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_new_password">
                {vm.t('account.newPassword')}
              </label>
              <input
                id="account_new_password"
                name="new_password"
                type="password"
                className={`form-control${
                  pw.touched.new_password && pw.errors.new_password
                    ? ' is-invalid'
                    : ''
                }`}
                value={pw.values.new_password}
                onChange={pw.handleChange}
                onBlur={pw.handleBlur}
                disabled={pw.isSubmitting}
                autoComplete="new-password"
              />
              {pw.touched.new_password && pw.errors.new_password ? (
                <div className="invalid-feedback">{pw.errors.new_password}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_confirm_password">
                {vm.t('account.confirmPassword')}
              </label>
              <input
                id="account_confirm_password"
                name="confirm_password"
                type="password"
                className={`form-control${
                  pw.touched.confirm_password && pw.errors.confirm_password
                    ? ' is-invalid'
                    : ''
                }`}
                value={pw.values.confirm_password}
                onChange={pw.handleChange}
                onBlur={pw.handleBlur}
                disabled={pw.isSubmitting}
                autoComplete="new-password"
              />
              {pw.touched.confirm_password && pw.errors.confirm_password ? (
                <div className="invalid-feedback">
                  {pw.errors.confirm_password}
                </div>
              ) : null}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={pw.isSubmitting}
            >
              {pw.isSubmitting
                ? vm.t('account.changingPassword')
                : vm.t('account.changePassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
