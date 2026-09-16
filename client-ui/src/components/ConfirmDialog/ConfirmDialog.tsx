import { Popup } from '../Popup'
import { useConfirmDialog, type ConfirmDialogProps } from './useConfirmDialog'

/** Small confirm/cancel modal built on Popup. */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const vm = useConfirmDialog(props)

  return (
    <Popup open={vm.open} onClose={vm.onClose} title={vm.title} size="sm">
      <p className="mb-3">{vm.message}</p>
      {vm.children}
      <div className="d-flex flex-wrap justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={vm.busy}
          onClick={vm.onClose}
        >
          {vm.cancelLabel}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${vm.danger ? 'btn-danger' : 'btn-primary'}`}
          disabled={vm.busy}
          onClick={vm.onConfirm}
        >
          {vm.busy ? (vm.busyLabel ?? vm.confirmLabel) : vm.confirmLabel}
        </button>
      </div>
    </Popup>
  )
}
