import { Form, Formik } from 'formik'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { TextInput } from '../../components/form/TextInput'
import { useProjectsNew, type ProjectFormValues } from './useProjectsNew'

export function ProjectsNewPage() {
  const vm = useProjectsNew()

  return (
    <div className="container py-4">
      <PageHeader
        title={vm.t('projects.newTitle')}
        actions={
          <Link className="btn btn-outline-secondary btn-sm" to="/projects">
            {vm.t('common.back')}
          </Link>
        }
      />

      {vm.formError ? (
        <div className="alert alert-danger" role="alert">
          {vm.formError}
        </div>
      ) : null}

      <Formik<ProjectFormValues>
        initialValues={vm.initialValues}
        validationSchema={vm.validationSchema}
        onSubmit={vm.onSubmit}
      >
        {({ isSubmitting, handleChange, handleBlur, values }) => (
          <Form noValidate className="col-12 col-lg-8 px-0">
            <TextInput
              name="title"
              label={vm.t('projects.fieldTitle')}
              autoComplete="off"
            />
            <div className="mb-3">
              <label className="form-label" htmlFor="description">
                {vm.t('projects.fieldDescription')}
              </label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows={4}
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="scientific_objective">
                {vm.t('projects.fieldObjective')}
              </label>
              <textarea
                id="scientific_objective"
                name="scientific_objective"
                className="form-control"
                rows={3}
                value={values.scientific_objective}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? vm.t('projects.creating')
                : vm.t('projects.createCta')}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
