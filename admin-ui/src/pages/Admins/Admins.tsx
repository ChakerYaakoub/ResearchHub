import { Popup } from '../../components/Popup'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useAdmins } from './useAdmins'
import '../../styles/adminLists.css'

export function AdminsPage() {
  const vm = useAdmins()
  const { formik } = vm

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <p className="text-muted small mb-0" style={{ maxWidth: '36rem' }}>
          {vm.copy.adminsSubtitle}
        </p>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={vm.openCreate}
        >
          {vm.copy.createAdmin}
        </button>
      </div>

      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}
      {vm.actionError ? (
        <div className="alert alert-danger" role="alert">
          {vm.actionError}
        </div>
      ) : null}
      {vm.success ? (
        <div className="alert alert-success" role="alert">
          {vm.success}
        </div>
      ) : null}

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : vm.users.length === 0 ? (
        <EmptyState message={vm.copy.adminsEmpty} />
      ) : (
        <>
          <div className="d-none d-md-block rh-admin-table-wrap">
            <table className="table rh-admin-table align-middle">
              <thead>
                <tr>
                  <th scope="col">{vm.copy.email}</th>
                  <th scope="col">{vm.copy.username}</th>
                  <th scope="col">{vm.copy.role}</th>
                  <th scope="col">{vm.copy.active}</th>
                  <th scope="col">{vm.copy.dateJoined}</th>
                  <th scope="col">{vm.copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {vm.users.map((u) => {
                  const isSelf = u.id === vm.meId
                  const busy = vm.busyId === u.id
                  return (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>
                        <StatusBadge status={u.role} />
                      </td>
                      <td>
                        {u.is_active ? vm.copy.active : vm.copy.inactive}
                      </td>
                      <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                      <td>
                        {!isSelf ? (
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            disabled={busy}
                            onClick={() =>
                              void vm.setActive(u.id, !u.is_active)
                            }
                          >
                            {u.is_active
                              ? vm.copy.deactivate
                              : vm.copy.activate}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="d-md-none rh-admin-card-list">
            {vm.users.map((u) => {
              const isSelf = u.id === vm.meId
              const busy = vm.busyId === u.id
              return (
                <article key={u.id} className="rh-admin-item-card">
                  <div className="d-flex justify-content-between gap-2 mb-2">
                    <strong className="text-break">{u.email}</strong>
                    <StatusBadge status={u.role} />
                  </div>
                  <p className="small text-muted mb-2">
                    {u.username} ·{' '}
                    {u.is_active ? vm.copy.active : vm.copy.inactive}
                  </p>
                  {!isSelf ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={busy}
                      onClick={() => void vm.setActive(u.id, !u.is_active)}
                    >
                      {u.is_active ? vm.copy.deactivate : vm.copy.activate}
                    </button>
                  ) : null}
                </article>
              )
            })}
          </div>
        </>
      )}

      <Popup
        open={vm.createOpen}
        title={vm.copy.createAdminTitle}
        onClose={vm.closeCreate}
        size="sm"
      >
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="create_admin_email">
              {vm.copy.email}
            </label>
            <input
              id="create_admin_email"
              name="email"
              type="email"
              className={`form-control${
                formik.touched.email && formik.errors.email ? ' is-invalid' : ''
              }`}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={vm.creating}
              autoComplete="off"
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="invalid-feedback">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="create_admin_username">
              {vm.copy.usernameOptional}
            </label>
            <input
              id="create_admin_username"
              name="username"
              type="text"
              className="form-control"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={vm.creating}
              autoComplete="off"
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="create_admin_password">
              {vm.copy.password}
            </label>
            <input
              id="create_admin_password"
              name="password"
              type="password"
              className={`form-control${
                formik.touched.password && formik.errors.password
                  ? ' is-invalid'
                  : ''
              }`}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={vm.creating}
              autoComplete="new-password"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="invalid-feedback">{formik.errors.password}</div>
            ) : null}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="create_admin_password_confirm">
              {vm.copy.passwordConfirm}
            </label>
            <input
              id="create_admin_password_confirm"
              name="passwordConfirm"
              type="password"
              className={`form-control${
                formik.touched.passwordConfirm && formik.errors.passwordConfirm
                  ? ' is-invalid'
                  : ''
              }`}
              value={formik.values.passwordConfirm}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={vm.creating}
              autoComplete="new-password"
            />
            {formik.touched.passwordConfirm && formik.errors.passwordConfirm ? (
              <div className="invalid-feedback">
                {formik.errors.passwordConfirm}
              </div>
            ) : null}
          </div>
          <div className="d-flex flex-wrap justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={vm.creating}
              onClick={vm.closeCreate}
            >
              {vm.copy.cancel}
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={vm.creating}
            >
              {vm.creating
                ? vm.copy.creatingAdmin
                : vm.copy.createAdminSubmit}
            </button>
          </div>
        </form>
      </Popup>
    </div>
  )
}
