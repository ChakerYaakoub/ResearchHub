import { Form, Formik } from 'formik'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { TextInput } from '../../components/form/TextInput'
import { useProjectDetails, type InviteFormValues } from './useProjectDetails'

export function ProjectDetailsPage() {
  const vm = useProjectDetails()

  return (
    <div className="container py-4">
      <PageHeader
        title={vm.project?.title ?? vm.t('projects.detailTitle')}
        actions={
          <Link className="btn btn-outline-secondary btn-sm" to="/projects">
            {vm.t('common.back')}
          </Link>
        }
      />

      {vm.loading ? <LoadingState label={vm.t('common.loading')} /> : null}
      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}

      {vm.project && !vm.loading ? (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <StatusBadge
                status={vm.project.status}
                label={vm.t(`status.${vm.project.status}`)}
              />
              <span className="small text-muted">
                {vm.t('projects.lifecycle')}: {vm.t(`status.${vm.project.status}`)}
              </span>
            </div>

            <dl className="row mb-4">
              <dt className="col-sm-3">{vm.t('projects.owner')}</dt>
              <dd className="col-sm-9 text-break">{vm.project.owner_email}</dd>
              <dt className="col-sm-3">{vm.t('projects.fieldDescription')}</dt>
              <dd className="col-sm-9">
                {vm.project.description || (
                  <span className="text-muted">—</span>
                )}
              </dd>
              <dt className="col-sm-3">{vm.t('projects.fieldObjective')}</dt>
              <dd className="col-sm-9">
                {vm.project.scientific_objective || (
                  <span className="text-muted">—</span>
                )}
              </dd>
            </dl>

            <h2 className="h5">{vm.t('projects.collaborators')}</h2>
            {vm.collaborators.length === 0 ? (
              <EmptyState message={vm.t('projects.collaboratorsEmpty')} />
            ) : (
              <ul className="list-group mb-4">
                {vm.collaborators.map((m) => (
                  <li
                    key={m.id}
                    className="list-group-item d-flex flex-column flex-sm-row justify-content-sm-between gap-1"
                  >
                    <span className="text-break">{m.user_email}</span>
                    <span className="badge text-bg-light align-self-start">
                      {m.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {vm.isOwner ? (
              <div className="border rounded p-3 mb-4">
                <h3 className="h6">{vm.t('projects.inviteTitle')}</h3>
                {vm.inviteMessage ? (
                  <div className="alert alert-success py-2" role="status">
                    {vm.inviteMessage}
                  </div>
                ) : null}
                {vm.inviteError ? (
                  <div className="alert alert-danger py-2" role="alert">
                    {vm.inviteError}
                  </div>
                ) : null}
                <Formik<InviteFormValues>
                  initialValues={vm.inviteInitial}
                  validationSchema={vm.inviteSchema}
                  onSubmit={vm.onInvite}
                >
                  {({ isSubmitting, values, handleChange, handleBlur }) => (
                    <Form noValidate>
                      <TextInput
                        name="email"
                        label={vm.t('projects.inviteEmail')}
                        type="email"
                        autoComplete="email"
                      />
                      <div className="mb-3">
                        <label className="form-label" htmlFor="role">
                          {vm.t('projects.inviteRole')}
                        </label>
                        <select
                          id="role"
                          name="role"
                          className="form-select"
                          value={values.role}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <option value="EDITOR">
                            {vm.t('projects.roleEditor')}
                          </option>
                          <option value="VIEWER">
                            {vm.t('projects.roleViewer')}
                          </option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={isSubmitting}
                      >
                        {vm.t('projects.inviteSubmit')}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            ) : null}
          </div>

          <div className="col-12 col-lg-4">
            {(
              [
                'sectionProposal',
                'sectionExperiments',
                'sectionPublications',
              ] as const
            ).map((key) => (
              <div key={key} className="border rounded p-3 mb-3 bg-light">
                <h2 className="h6 mb-1">{vm.t(`projects.${key}`)}</h2>
                <p className="small text-muted mb-0">
                  {vm.t('projects.sectionComingSoon')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
