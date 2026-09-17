import { Form, Formik } from 'formik'
import { Navigate } from 'react-router-dom'
import { DocumentTitle } from '../../components/DocumentTitle'
import { TextInput } from '../../components/form/TextInput'
import { useLogin, type LoginFormValues } from './useLogin'

export function LoginPage() {
  const vm = useLogin()

  if (vm.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="container py-5">
      <DocumentTitle title={`${vm.copy.loginTitle} — ResearchHub Admin`} />
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
              {({ isSubmitting }) => (
                <Form noValidate>
                  <TextInput
                    name="email"
                    label={vm.copy.email}
                    type="email"
                    autoComplete="email"
                    required
                  />
                  <TextInput
                    name="password"
                    label={vm.copy.password}
                    type="password"
                    autoComplete="current-password"
                    required
                  />
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
