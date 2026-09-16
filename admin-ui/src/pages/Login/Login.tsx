import { Form, Formik } from 'formik'
import { Navigate } from 'react-router-dom'
import { useLogin, type LoginFormValues } from './useLogin'

export function LoginPage() {
  const vm = useLogin()

  if (vm.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-6 col-lg-4">
          <div className="border rounded p-4 bg-white shadow-sm">
            <h1 className="h3 mb-1">{vm.copy.loginTitle}</h1>
            <p className="text-muted small mb-4">{vm.copy.loginSubtitle}</p>

            <Formik<LoginFormValues>
              initialValues={vm.initialValues}
              validationSchema={vm.validationSchema}
              onSubmit={vm.onSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isSubmitting,
                status,
              }) => (
                <Form noValidate>
                  {status ? (
                    <div className="alert alert-danger py-2" role="alert">
                      {status}
                    </div>
                  ) : null}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="email">
                      {vm.copy.email}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`form-control${touched.email && errors.email ? ' is-invalid' : ''}`}
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.email && errors.email ? (
                      <div className="invalid-feedback">{errors.email}</div>
                    ) : null}
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="password">
                      {vm.copy.password}
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className={`form-control${touched.password && errors.password ? ' is-invalid' : ''}`}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.password && errors.password ? (
                      <div className="invalid-feedback">{errors.password}</div>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isSubmitting}
                  >
                    {vm.copy.loginSubmit}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}
