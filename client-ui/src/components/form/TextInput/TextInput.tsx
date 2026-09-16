import { useTextInput, type TextInputProps } from './useTextInput'
import './TextInput.css'

/** Formik-backed Bootstrap control with stable label / message slot height. */
export function TextInput(props: TextInputProps) {
  const vm = useTextInput(props)

  return (
    <div className="rh-text-input">
      <label className="form-label" htmlFor={vm.inputId}>
        {vm.label}
      </label>
      <input
        {...vm.field}
        {...vm.rest}
        id={vm.inputId}
        className={vm.inputClassName}
        aria-invalid={vm.showError || undefined}
        aria-describedby={vm.describedBy}
      />
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
