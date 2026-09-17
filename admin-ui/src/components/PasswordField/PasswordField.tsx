import { usePasswordField, type PasswordFieldProps } from './usePasswordField'
import './PasswordField.css'

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 6a9.8 9.8 0 0 1 9.5 6 9.8 9.8 0 0 1-19 0A9.8 9.8 0 0 1 12 6zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.3 2.3 21.7 20.7l-1.4 1.4-3.1-3.1A11.5 11.5 0 0 1 12 18c-4.5 0-8.3-2.5-10.5-6.2.7-1.2 1.7-2.3 2.8-3.2L1.9 3.7 3.3 2.3zm5.7 5.7A4 4 0 0 0 12 16a4 4 0 0 0 3.3-1.7l-1.5-1.5A2 2 0 0 1 12 14a2 2 0 0 1-2-2c0-.4.1-.8.3-1.1L9 8zM12 6c.8 0 1.5.1 2.2.3l-1.6 1.6A4 4 0 0 0 8.9 12L7.3 10.4C8.1 7.8 9.9 6 12 6zm9.5 6c-.5.9-1.2 1.7-2 2.4l-1.5-1.5c.5-.4.9-.9 1.3-1.4A9.8 9.8 0 0 0 12 8c-.3 0-.6 0-.9.1L9.5 6.5c.8-.3 1.6-.5 2.5-.5 4.5 0 8.3 2.5 10.5 6z"
      />
    </svg>
  )
}

/** Password input with show/hide toggle (admin-ui). */
export function PasswordField(props: PasswordFieldProps) {
  const vm = usePasswordField(props)

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={vm.id}>
        {vm.label}
        {vm.required ? (
          <span className="rh-required-mark" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div className="rh-password-field">
          <input
          id={vm.id}
          name={vm.name}
          type={vm.inputType}
          className={vm.inputClassName}
          value={vm.value}
          onChange={vm.onChange}
          onBlur={vm.onBlur}
          autoComplete={vm.autoComplete}
          disabled={vm.disabled}
          aria-required={vm.required || undefined}
          aria-invalid={vm.invalid || undefined}
        />
        <button
          type="button"
          className="rh-password-field-toggle"
          onClick={vm.toggle}
          aria-label={vm.toggleLabel}
          aria-pressed={vm.visible}
          tabIndex={-1}
          disabled={vm.disabled}
        >
          <EyeIcon open={vm.visible} />
        </button>
      </div>
      {vm.error ? <div className="invalid-feedback d-block">{vm.error}</div> : null}
    </div>
  )
}
