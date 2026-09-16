import type { ReactNode } from 'react'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onClose: () => void
  busy?: boolean
  busyLabel?: string
  /** Danger styling for destructive actions. */
  danger?: boolean
  children?: ReactNode
}

export function useConfirmDialog(props: ConfirmDialogProps) {
  return {
    open: props.open,
    title: props.title,
    message: props.message,
    confirmLabel: props.confirmLabel,
    cancelLabel: props.cancelLabel,
    onConfirm: props.onConfirm,
    onClose: props.onClose,
    busy: Boolean(props.busy),
    busyLabel: props.busyLabel,
    danger: Boolean(props.danger),
    children: props.children,
  }
}
