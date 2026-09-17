import { useEffect, useRef, useState } from 'react'

export type UseUserMenuArgs = {
  onLogout: () => void | Promise<void>
}

/** Controlled account dropdown open/close + outside click. */
export function useUserMenu({ onLogout }: UseUserMenuArgs) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function onDocClick(event: MouseEvent) {
      const root = rootRef.current
      if (!root) return
      if (!root.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function toggle() {
    setOpen((v) => !v)
  }

  function close() {
    setOpen(false)
  }

  async function handleLogout() {
    close()
    await onLogout()
  }

  return {
    open,
    rootRef,
    toggle,
    close,
    handleLogout,
  }
}
