import { useId, useState, type InputHTMLAttributes } from 'react'
import { useField } from 'formik'

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
  type = 'text',
  ...rest
}: TextInputProps) {
  const [field, meta] = useField(name)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const reactId = useId()
  const inputId = id ?? name
  const showError = Boolean(meta.touched && meta.error)
  const message = showError ? meta.error : (helperText ?? '')
  const describedBy = message ? `${inputId}-msg` : undefined
  const isPassword = type === 'password'
  const inputType = isPassword && passwordVisible ? 'text' : type
  const inputClassName = [
    'form-control',
    showError ? 'is-invalid' : '',
    isPassword ? 'rh-text-input-password' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  function togglePasswordVisible() {
    setPasswordVisible((v) => !v)
  }

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
    inputType,
    isPassword,
    passwordVisible,
    togglePasswordVisible,
    toggleId: `${reactId}-pw-toggle`,
  }
}
