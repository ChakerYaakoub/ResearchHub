import { toast } from 'react-toastify'

export function notifySuccess(message: string): void {
  toast.success(message)
}

export function notifyError(message: string): void {
  toast.error(message)
}
