import { useField } from 'formik'
import type { InputHTMLAttributes } from 'react'
import './TextInput.css'

type TextInputProps = {
  name: string
  label: string
  helperText?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>

/** Formik-backed Bootstrap control with label, helper, and error text. */
export function TextInput({
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
  const describedBy = [
    helperText ? `${inputId}-help` : null,
    showError ? `${inputId}-error` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="mb-3 rh-text-input">
      <label className="form-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...field}
        {...rest}
        id={inputId}
        className={[
          'form-control',
          showError ? 'is-invalid' : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={showError || undefined}
        aria-describedby={describedBy || undefined}
      />
      {helperText && !showError ? (
        <div id={`${inputId}-help`} className="form-text">
          {helperText}
        </div>
      ) : null}
      {showError ? (
        <div id={`${inputId}-error`} className="invalid-feedback d-block">
          {meta.error}
        </div>
      ) : null}
    </div>
  )
}
