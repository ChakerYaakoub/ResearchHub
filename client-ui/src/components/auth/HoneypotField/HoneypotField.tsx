import { Field } from 'formik'
import './HoneypotField.css'

/** CSS-hidden field bots often fill; leave empty for real users. */
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
