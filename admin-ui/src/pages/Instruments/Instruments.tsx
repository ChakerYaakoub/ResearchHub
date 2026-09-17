import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { Popup } from '../../components/Popup'
import { StatusBadge } from '../../components/StatusBadge'
import { useInstruments } from './useInstruments'
import '../../styles/adminLists.css'

export function InstrumentsPage() {
  const vm = useInstruments()

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <p className="text-muted small mb-0" style={{ maxWidth: '36rem' }}>
          {vm.copy.instrumentsSubtitle}
        </p>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={vm.openCreate}
        >
          {vm.copy.createInstrument}
        </button>
      </div>

      {vm.filtersUi}

      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {vm.loading ? (
        <LoadingState label={vm.copy.loading} />
      ) : vm.items.length === 0 ? (
        <EmptyState message={vm.copy.instrumentsEmpty} />
      ) : (
        <div className="rh-admin-table-wrap">
          <table className="table rh-admin-table align-middle">
            <thead>
              <tr>
                <th scope="col">{vm.copy.code}</th>
                <th scope="col">{vm.copy.name}</th>
                <th scope="col">{vm.copy.installation}</th>
                <th scope="col">{vm.copy.technique}</th>
                <th scope="col">{vm.copy.status}</th>
                <th scope="col">{vm.copy.actions}</th>
              </tr>
            </thead>
            <tbody>
              {vm.items.map((row) => (
                <tr key={row.id}>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.installation_name}</td>
                  <td>{row.technique || vm.copy.none}</td>
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
          vm.editingId ? vm.copy.editInstrument : vm.copy.createInstrument
        }
        size="md"
      >
        <div className="mb-3">
          <label className="form-label" htmlFor="instr-installation">
            {vm.copy.installation}
          </label>
          <select
            id="instr-installation"
            className="form-select"
            value={vm.form.installation}
            onChange={(e) =>
              vm.setForm({ ...vm.form, installation: e.target.value })
            }
          >
            <option value="">{vm.copy.none}</option>
            {vm.installations.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div className="row g-2">
          <div className="col-md-4 mb-3">
            <label className="form-label" htmlFor="instr-code">
              {vm.copy.code}
            </label>
            <input
              id="instr-code"
              className="form-control"
              value={vm.form.code}
              onChange={(e) => vm.setForm({ ...vm.form, code: e.target.value })}
            />
          </div>
          <div className="col-md-8 mb-3">
            <label className="form-label" htmlFor="instr-name">
              {vm.copy.name}
            </label>
            <input
              id="instr-name"
              className="form-control"
              value={vm.form.name}
              onChange={(e) => vm.setForm({ ...vm.form, name: e.target.value })}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="instr-technique">
            {vm.copy.technique}
          </label>
          <input
            id="instr-technique"
            className="form-control"
            value={vm.form.technique}
            onChange={(e) =>
              vm.setForm({ ...vm.form, technique: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="instr-desc">
            {vm.copy.description}
          </label>
          <textarea
            id="instr-desc"
            className="form-control"
            rows={2}
            value={vm.form.description}
            onChange={(e) =>
              vm.setForm({ ...vm.form, description: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="instr-status">
            {vm.copy.status}
          </label>
          <select
            id="instr-status"
            className="form-select"
            value={vm.form.status}
            onChange={(e) =>
              vm.setForm({
                ...vm.form,
                status: e.target.value as 'AVAILABLE' | 'UNAVAILABLE',
              })
            }
          >
            <option value="AVAILABLE">{vm.copy.available}</option>
            <option value="UNAVAILABLE">{vm.copy.unavailable}</option>
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
            disabled={
              vm.saving ||
              !vm.form.installation ||
              !vm.form.code.trim() ||
              !vm.form.name.trim()
            }
            onClick={() => void vm.onSave()}
          >
            {vm.copy.save}
          </button>
        </div>
      </Popup>

      <ConfirmDialog
        open={vm.pendingDeleteId != null}
        title={vm.copy.deleteInstrumentTitle}
        message={vm.copy.deleteInstrumentMessage}
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
