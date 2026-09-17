import { Field } from 'formik'
import './HoneypotField.css'

/**
 * Hidden Formik field `company` — bots often fill it; humans leave it empty.
 * Value is sent to login/register; backend rejects non-empty honeypot.
 */
export function HoneypotField() {
  return (
    <div className="rh-honeypot" aria-hidden="true">
      <label htmlFor="rh-company">Company</label>
      <Field
        id="rh-company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  )
}
