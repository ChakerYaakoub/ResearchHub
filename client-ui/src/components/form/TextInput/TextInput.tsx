import { useTranslation } from 'react-i18next'
import { useTextInput, type TextInputProps } from './useTextInput'
import './TextInput.css'

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

/** Formik-backed Bootstrap control with stable label / message slot height. */
export function TextInput(props: TextInputProps) {
  const { t } = useTranslation()
  const vm = useTextInput(props)

  return (
    <div className="rh-text-input">
      <label className="form-label" htmlFor={vm.inputId}>
        {vm.label}
      </label>
      {vm.isPassword ? (
        <div className="rh-text-input-wrap">
          <input
            {...vm.field}
            {...vm.rest}
            id={vm.inputId}
            type={vm.inputType}
            className={vm.inputClassName}
            aria-invalid={vm.showError || undefined}
            aria-describedby={vm.describedBy}
          />
          <button
            type="button"
            id={vm.toggleId}
            className="rh-text-input-toggle"
            onClick={vm.togglePasswordVisible}
            aria-label={
              vm.passwordVisible
                ? t('common.hidePassword')
                : t('common.showPassword')
            }
            aria-pressed={vm.passwordVisible}
            tabIndex={-1}
          >
            <EyeIcon open={vm.passwordVisible} />
          </button>
        </div>
      ) : (
        <input
          {...vm.field}
          {...vm.rest}
          id={vm.inputId}
          type={vm.inputType}
          className={vm.inputClassName}
          aria-invalid={vm.showError || undefined}
          aria-describedby={vm.describedBy}
        />
      )}
      <div
        id={`${vm.inputId}-msg`}
        className={`rh-text-input-slot${vm.showError ? ' is-error' : ''}`}
        role={vm.showError ? 'alert' : undefined}
      >
        {vm.message || '\u00a0'}
      </div>
    </div>
  )
}
