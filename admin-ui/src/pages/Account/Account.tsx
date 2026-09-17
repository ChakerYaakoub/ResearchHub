import { PasswordField } from '../../components/PasswordField'
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
          <h2 className="h5 mb-3">{vm.copy.profileSection}</h2>
          <form onSubmit={pf.handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_email">
                {vm.copy.email}
              </label>
              <input
                id="account_email"
                type="email"
                className="form-control"
                value={pf.values.email}
                disabled
                readOnly
              />
              <div className="form-text">{vm.copy.emailHint}</div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="account_username">
                {vm.copy.username}
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
                {vm.copy.firstName}
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
                {vm.copy.lastName}
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
              {pf.isSubmitting ? vm.copy.saving : vm.copy.saveProfile}
            </button>
          </form>
        </div>

        <div className="col-12 col-lg-6">
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
    </div>
  )
}
