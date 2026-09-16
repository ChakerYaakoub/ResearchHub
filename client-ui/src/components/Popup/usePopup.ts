import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'

export type PopupSize = 'sm' | 'md' | 'lg'

export type PopupProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: PopupSize
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Focus helpers + body scroll lock for Popup. */
export function usePopup({
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
    document.body.classList.add('rh-popup-open')
    return () => {
      document.body.classList.remove('rh-popup-open')
    }
  }, [open])

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

  function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return {
    open,
    onClose,
    title,
    children,
    size,
    t,
    titleId,
    panelRef,
    onKeyDown,
    onBackdropMouseDown,
  }
}
