import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type TransitionEvent,
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

/** Animated modal shell: backdrop, ESC, light focus trap. */
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
  const previousFocus = useRef<HTMLElement | null>(null)
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!open) {
      setEntered(false)
      setClosing(false)
      return
    }
    previousFocus.current = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => setEntered(true))
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = prevOverflow
      previousFocus.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open || !entered || closing) return
    const panel = panelRef.current
    if (!panel) return
    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
    focusables[0]?.focus()
  }, [open, entered, closing])

  function requestClose() {
    if (closing) return
    setClosing(true)
    setEntered(false)
  }

  function onTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (closing) onClose()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      requestClose()
      return
    }
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusables = [
      ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ].filter((el) => el.offsetParent !== null || el === document.activeElement)
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!open && !closing) return null

  return (
    <div
      className={`popup-backdrop${entered ? ' is-open' : ''}${closing ? ' is-closing' : ''}`}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
      onTransitionEnd={onTransitionEnd}
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
            onClick={requestClose}
          >
            ×
          </button>
        </div>
        <div className="popup-body">{children}</div>
      </div>
    </div>
  )
}
