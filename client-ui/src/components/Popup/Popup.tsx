import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import './Popup.css'

export type PopupSize = 'sm' | 'md' | 'lg'

type PopupProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: PopupSize
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Simple modal: backdrop + panel. No body scroll lock. */
export function Popup({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: PopupProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
    focusables?.[0]?.focus()
  }, [open])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      className="popup-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={`popup-panel popup-panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="popup-header">
          {title ? (
            <h2 id={titleId} className="popup-title">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="popup-close"
            aria-label={t('common.close')}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="popup-body">{children}</div>
      </div>
    </div>
  )
}
