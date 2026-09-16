import { usePopup, type PopupProps } from './usePopup'
import './Popup.css'

export type { PopupSize } from './usePopup'

/** Simple modal: backdrop + panel. Locks page scroll while open. */
export function Popup(props: PopupProps) {
  const vm = usePopup(props)

  if (!vm.open) return null

  return (
    <div
      className="popup-backdrop"
      role="presentation"
      onMouseDown={vm.onBackdropMouseDown}
    >
      <div
        ref={vm.panelRef}
        className={`popup-panel popup-panel--${vm.size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={vm.title ? vm.titleId : undefined}
        tabIndex={-1}
        onKeyDown={vm.onKeyDown}
      >
        <div className="popup-header">
          {vm.title ? (
            <h2 id={vm.titleId} className="popup-title">
              {vm.title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="popup-close"
            aria-label={vm.t('common.close')}
            onClick={vm.onClose}
          >
            ×
          </button>
        </div>
        <div className="popup-body">{vm.children}</div>
      </div>
    </div>
  )
}
