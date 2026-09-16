import { useField } from 'formik'
import type { InputHTMLAttributes } from 'react'

export type TextInputProps = {
  name: string
  label: string
  helperText?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>

/** Formik field + derived error/message slots for TextInput. */
export function useTextInput({
  name,
  label,
  helperText,
  id,
  className,
  ...rest
}: TextInputProps) {
  const [field, meta] = useField(name)
  const inputId = id ?? name
  const showError = Boolean(meta.touched && meta.error)
  const message = showError ? meta.error : (helperText ?? '')
  const describedBy = message ? `${inputId}-msg` : undefined
  const inputClassName = [
    'form-control',
    showError ? 'is-invalid' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    field,
    label,
    helperText,
    rest,
    inputId,
    showError,
    message,
    describedBy,
    inputClassName,
  }
}
