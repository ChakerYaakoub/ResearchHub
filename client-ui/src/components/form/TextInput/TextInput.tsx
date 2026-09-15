import { useField } from 'formik'
import type { InputHTMLAttributes } from 'react'
import './TextInput.css'

type TextInputProps = {
  name: string
  label: string
  helperText?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>

/** Formik-backed Bootstrap control with stable label / message slot height. */
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
  const message = showError ? meta.error : (helperText ?? '')
  const describedBy = message ? `${inputId}-msg` : undefined

  return (
    <div className="rh-text-input">
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
        aria-describedby={describedBy}
      />
      <div
        id={`${inputId}-msg`}
        className={`rh-text-input-slot${showError ? ' is-error' : ''}`}
        role={showError ? 'alert' : undefined}
      >
        {message || '\u00a0'}
      </div>
    </div>
  )
}
