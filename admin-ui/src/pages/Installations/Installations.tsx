import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { Popup } from '../../components/Popup'
import { StatusBadge } from '../../components/StatusBadge'
import { useInstallations } from './useInstallations'
import '../../styles/adminLists.css'

export function InstallationsPage() {
  const vm = useInstallations()

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <p className="text-muted small mb-0" style={{ maxWidth: '36rem' }}>
          {vm.copy.installationsSubtitle}
        </p>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={vm.openCreate}
        >
          {vm.copy.createInstallation}
        </button>
      </div>

      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {vm.filtersUi}

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : vm.items.length === 0 ? (
        <EmptyState message={vm.copy.installationsEmpty} />
      ) : (
        <div className="rh-admin-table-wrap">
          <table className="table rh-admin-table align-middle">
            <thead>
              <tr>
                <th scope="col">{vm.copy.name}</th>
                <th scope="col">{vm.copy.location}</th>
                <th scope="col">{vm.copy.status}</th>
                <th scope="col">{vm.copy.actions}</th>
              </tr>
            </thead>
            <tbody>
              {vm.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="fw-semibold">{row.name}</div>
                    {row.description ? (
                      <div className="small text-muted">{row.description}</div>
                    ) : null}
                  </td>
                  <td>{row.location || vm.copy.none}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => vm.openEdit(row)}
                      >
                        {vm.copy.edit}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => vm.requestDelete(row.id)}
                      >
                        {vm.copy.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Popup
        open={vm.showForm}
        onClose={vm.closeForm}
        title={
          vm.editingId
            ? vm.copy.editInstallation
            : vm.copy.createInstallation
        }
        size="md"
      >
        <div className="mb-3">
          <label className="form-label" htmlFor="inst-name">
            {vm.copy.name}
          </label>
          <input
            id="inst-name"
            className="form-control"
            value={vm.form.name}
            onChange={(e) => vm.setForm({ ...vm.form, name: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="inst-location">
            {vm.copy.location}
          </label>
          <input
            id="inst-location"
            className="form-control"
            value={vm.form.location}
            onChange={(e) =>
              vm.setForm({ ...vm.form, location: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="inst-desc">
            {vm.copy.description}
          </label>
          <textarea
            id="inst-desc"
            className="form-control"
            rows={2}
            value={vm.form.description}
            onChange={(e) =>
              vm.setForm({ ...vm.form, description: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="inst-status">
            {vm.copy.status}
          </label>
          <select
            id="inst-status"
            className="form-select"
            value={vm.form.status}
            onChange={(e) =>
              vm.setForm({
                ...vm.form,
                status: e.target.value as 'ACTIVE' | 'INACTIVE',
              })
            }
          >
            <option value="ACTIVE">{vm.copy.active}</option>
            <option value="INACTIVE">{vm.copy.inactive}</option>
          </select>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={vm.saving}
            onClick={vm.closeForm}
          >
            {vm.copy.cancel}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={vm.saving || !vm.form.name.trim()}
            onClick={() => void vm.onSave()}
          >
            {vm.copy.save}
          </button>
        </div>
      </Popup>

      <ConfirmDialog
        open={vm.pendingDeleteId != null}
        title={vm.copy.deleteInstallationTitle}
        message={vm.copy.deleteInstallationMessage}
        confirmLabel={vm.copy.delete}
        cancelLabel={vm.copy.cancel}
        busy={vm.deleting}
        busyLabel={vm.copy.deleting}
        danger
        onConfirm={() => void vm.confirmDelete()}
        onClose={vm.closeDelete}
      />
    </div>
  )
}
