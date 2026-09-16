import { Form, Formik } from 'formik'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { PageHeader } from '../../components/PageHeader'
import { Popup } from '../../components/Popup'
import { StatusBadge } from '../../components/StatusBadge'
import { TextInput } from '../../components/form/TextInput'
import { ExperimentsSection } from './ExperimentsSection'
import { ProjectDetailsSkeleton } from './ProjectDetailsSkeleton'
import { ProposalSection } from './ProposalSection'
import { PublicationsSection } from './PublicationsSection'
import { useProjectDetails, type InviteFormValues } from './useProjectDetails'
import './ProjectDetails.css'

function roleClass(role: string) {
  const r = role.toLowerCase()
  if (r === 'owner') return 'rh-team-role rh-team-role--owner'
  if (r === 'editor') return 'rh-team-role rh-team-role--editor'
  return 'rh-team-role rh-team-role--viewer'
}

function initialsFromEmail(email: string) {
  const local = email.split('@')[0] ?? '?'
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  return local.slice(0, 2).toUpperCase() || '?'
}

export function ProjectDetailsPage() {
  const vm = useProjectDetails()

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <PageHeader
        title={vm.project?.title ?? vm.t('projects.detailTitle')}
        actions={
          <>
            {vm.project && !vm.loading ? (
              <StatusBadge
                status={vm.project.status}
                label={vm.t(`status.${vm.project.status}`)}
              />
            ) : null}
            {vm.canComplete ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={vm.completing || vm.deleting}
                onClick={vm.requestComplete}
              >
                {vm.t('projects.complete')}
              </button>
            ) : null}
            {vm.isOwner ? (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                disabled={vm.deleting || vm.completing}
                onClick={vm.requestDelete}
              >
                {vm.t('projects.delete')}
              </button>
            ) : null}
            <Link className="btn btn-outline-secondary btn-sm" to="/projects">
              {vm.t('common.back')}
            </Link>
          </>
        }
      />

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
      {vm.deleteError ? (
        <div className="alert alert-danger" role="alert">
          {vm.deleteError}
        </div>
      ) : null}

      {vm.loading ? (
        <div className="position-relative">
          <LoadingState overlay label={vm.t('common.loading')} />
          <ProjectDetailsSkeleton />
        </div>
      ) : null}

      {vm.project && !vm.loading ? (
        <>
          <section className="border rounded p-3 mb-4 bg-white">
            <h2 className="h5 mb-3">{vm.t('projects.overview')}</h2>
            <dl className="row mb-0">
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
              <dt className="col-sm-3 col-lg-2 mb-0">
                {vm.t('projects.fieldObjective')}
              </dt>
              <dd className="col-sm-9 col-lg-10 mb-0">
                {vm.project.scientific_objective || (
                  <span className="text-muted">—</span>
                )}
              </dd>
            </dl>
          </section>

          <section className="rh-team">
            <h2 className="rh-team-title">{vm.t('projects.team')}</h2>

            <div className="rh-team-block">
              <h3 className="rh-team-block-title">
                {vm.t('projects.collaborators')}
              </h3>
              {vm.collaborators.length === 0 ? (
                <EmptyState
                  compact
                  message={vm.t('projects.collaboratorsEmpty')}
                />
              ) : (
                <ul className="rh-team-list">
                  {vm.collaborators.map((m) => (
                    <li key={m.id} className="rh-team-row">
                      <div className="rh-team-row-main">
                        <span className="rh-team-avatar" aria-hidden="true">
                          {initialsFromEmail(m.user_email)}
                        </span>
                        <span className="rh-team-email">{m.user_email}</span>
                      </div>
                      <span className={roleClass(m.role)}>{m.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {vm.isOwner ? (
              <>
                <div className="rh-team-block">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <h3 className="rh-team-block-title mb-0">
                      {vm.t('projects.sentInvitations')}
                    </h3>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={vm.openInvite}
                    >
                      {vm.t('projects.inviteTitle')}
                    </button>
                  </div>
                  {vm.inviteMessage ? (
                    <div className="alert alert-success py-2" role="status">
                      {vm.inviteMessage}
                    </div>
                  ) : null}
                  {vm.projectInvitations.length === 0 ? (
                    <EmptyState
                      compact
                      message={vm.t('projects.sentInvitationsEmpty')}
                    />
                  ) : (
                    <ul className="rh-team-list">
                      {vm.projectInvitations.map((inv) => (
                        <li key={inv.id} className="rh-team-row">
                          <div className="rh-team-row-main">
                            <span className="rh-team-avatar" aria-hidden="true">
                              {initialsFromEmail(inv.email)}
                            </span>
                            <div className="min-w-0">
                              <div className="rh-team-email">{inv.email}</div>
                              <div className="rh-team-meta">
                                {vm.t(`status.${inv.status}`)} ·{' '}
                                {vm.t('invitations.expires')}:{' '}
                                {new Date(inv.expires_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className={roleClass(inv.role)}>{inv.role}</span>
                            {inv.status === 'PENDING' ? (
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => vm.requestCancelInvite(inv)}
                              >
                                {vm.t('projects.cancelInvite')}
                              </button>
                            ) : (
                              <StatusBadge
                                status={inv.status}
                                label={vm.t(`status.${inv.status}`)}
                              />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Popup
                  open={vm.inviteOpen}
                  onClose={vm.closeInvite}
                  title={vm.t('projects.inviteTitle')}
                  size="sm"
                >
                  <p className="rh-team-hint">{vm.t('projects.inviteHint')}</p>
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
                        <div className="d-flex flex-wrap justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            disabled={isSubmitting}
                            onClick={vm.closeInvite}
                          >
                            {vm.t('common.cancel')}
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={isSubmitting}
                          >
                            {vm.t('projects.inviteSubmit')}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Popup>
              </>
            ) : null}
          </section>

          <ProposalSection
            projectId={vm.project.id}
            project={vm.project}
            canEdit={vm.canEdit}
            onProjectChanged={() => void vm.refreshProject()}
          />
          {vm.canEdit && !vm.canEditExperiments ? (
            <p className="small text-muted mb-2">
              {vm.t('experiments.lockedUntilApproved')}
            </p>
          ) : null}
          <ExperimentsSection
            projectId={vm.project.id}
            project={vm.project}
            canEdit={vm.canEditExperiments}
            onProjectChanged={() => void vm.refreshProject()}
          />
          {vm.canEdit && !vm.canEditPublications ? (
            <p className="small text-muted mb-2">
              {vm.t('publications.lockedUntilInProgress')}
            </p>
          ) : null}
          <PublicationsSection
            projectId={vm.project.id}
            project={vm.project}
            canEdit={vm.canEditPublications}
          />
        </>
      ) : null}

      {vm.confirmDialog ? (
        <ConfirmDialog
          open={vm.confirmOpen}
          title={vm.confirmDialog.title}
          message={vm.confirmDialog.message}
          confirmLabel={vm.confirmDialog.confirmLabel}
          cancelLabel={vm.t('common.cancel')}
          busy={vm.confirmBusy}
          busyLabel={vm.confirmDialog.busyLabel}
          danger={vm.confirmDialog.danger}
          onConfirm={() => void vm.onConfirmAction()}
          onClose={vm.closeConfirm}
        />
      ) : null}
    </div>
  )
}
