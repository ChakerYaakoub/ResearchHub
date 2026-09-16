import { Form, Formik } from 'formik'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { TextInput } from '../../components/form/TextInput'
import { ExperimentsSection } from './ExperimentsSection'
import { ProposalSection } from './ProposalSection'
import { PublicationsSection } from './PublicationsSection'
import { useProjectDetails, type InviteFormValues } from './useProjectDetails'

export function ProjectDetailsPage() {
  const vm = useProjectDetails()

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <PageHeader
        title={vm.project?.title ?? vm.t('projects.detailTitle')}
        actions={
          <>
            {vm.canComplete ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={vm.completing}
                onClick={() => void vm.onComplete()}
              >
                {vm.completing
                  ? vm.t('projects.completing')
                  : vm.t('projects.complete')}
              </button>
            ) : null}
            <Link className="btn btn-outline-secondary btn-sm" to="/projects">
              {vm.t('common.back')}
            </Link>
          </>
        }
      />

      {vm.loading ? <LoadingState label={vm.t('common.loading')} /> : null}
      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}
      {vm.completeError ? (
        <div className="alert alert-danger" role="alert">
          {vm.completeError}
        </div>
      ) : null}

      {vm.project && !vm.loading ? (
        <>
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <StatusBadge
              status={vm.project.status}
              label={vm.t(`status.${vm.project.status}`)}
            />
            <span className="small text-muted">
              {vm.t('projects.lifecycle')}:{' '}
              {vm.t(`status.${vm.project.status}`)}
            </span>
          </div>

          <dl className="row mb-4">
            <dt className="col-sm-3 col-lg-2">{vm.t('projects.owner')}</dt>
            <dd className="col-sm-9 col-lg-10 text-break">
              {vm.project.owner_email}
            </dd>
            <dt className="col-sm-3 col-lg-2">
              {vm.t('projects.fieldDescription')}
            </dt>
            <dd className="col-sm-9 col-lg-10">
              {vm.project.description || (
                <span className="text-muted">—</span>
              )}
            </dd>
            <dt className="col-sm-3 col-lg-2">
              {vm.t('projects.fieldObjective')}
            </dt>
            <dd className="col-sm-9 col-lg-10">
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
            <div className="border rounded p-3 mb-4 bg-white">
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
                  <Form noValidate className="col-12 col-lg-6 px-0">
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

          <ProposalSection
            projectId={vm.project.id}
            project={vm.project}
            canEdit={vm.canEdit}
            onProjectChanged={() => void vm.refreshProject()}
          />
          <ExperimentsSection
            projectId={vm.project.id}
            project={vm.project}
            canEdit={vm.canEdit}
            onProjectChanged={() => void vm.refreshProject()}
          />
          <PublicationsSection
            projectId={vm.project.id}
            project={vm.project}
            canEdit={vm.canEdit}
          />
        </>
      ) : null}
    </div>
  )
}
