import { useState, type ChangeEvent, type FocusEvent } from 'react'
import { copy } from '../../copy'

export type PasswordFieldProps = {
  id: string
  name: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
  autoComplete?: string
  invalid?: boolean
  error?: string
  disabled?: boolean
  /** Show a red * on the label. */
  required?: boolean
}

export function usePasswordField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  autoComplete = 'current-password',
  invalid = false,
  error,
  disabled = false,
  required = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return {
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    autoComplete,
    invalid,
    error,
    disabled,
    required,
    visible,
    inputType: visible ? 'text' : 'password',
    inputClassName: `form-control rh-password-field-input${invalid ? ' is-invalid' : ''}`,
    toggleLabel: visible ? copy.hidePassword : copy.showPassword,
    toggle: () => setVisible((v) => !v),
  }
}
