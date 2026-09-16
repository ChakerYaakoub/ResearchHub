import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { LoadingState } from '../../components/LoadingState'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { ExperimentsSection } from './ExperimentsSection'
import { ProjectDetailsSkeleton } from './ProjectDetailsSkeleton'
import { ProposalSection } from './ProposalSection'
import { PublicationsSection } from './PublicationsSection'
import { SubmitSection } from './SubmitSection'
import { TeamSection } from './TeamSection'
import { useProjectDetails } from './useProjectDetails'
import './ProjectDetails.css'

export function ProjectDetailsPage() {
  const vm = useProjectDetails()

  const teamProps = {
    t: vm.t,
    collaborators: vm.collaborators,
    projectInvitations: vm.projectInvitations,
    isOwner: vm.isOwner,
    inviteInitial: vm.inviteInitial,
    inviteSchema: vm.inviteSchema,
    onInvite: vm.onInvite,
    inviteOpen: vm.inviteOpen,
    openInvite: vm.openInvite,
    closeInvite: vm.closeInvite,
    requestCancelInvite: vm.requestCancelInvite,
    inviteMessage: vm.inviteMessage,
    inviteError: vm.inviteError,
  }

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

          <TeamSection {...teamProps} showTitle />

          {vm.showDraftPrep ? (
            <section className="rh-draft-prep mb-3">
              <h2 className="h6 mb-1">{vm.t('projects.draftPrep.title')}</h2>
              <p className="small text-muted mb-3">
                {vm.project.status === 'REJECTED'
                  ? vm.t('projects.draftPrep.rejectedIntro')
                  : vm.t('projects.draftPrep.intro')}
              </p>
              <ol className="rh-draft-prep-steps list-unstyled d-flex flex-wrap gap-2 mb-0">
                {vm.draftPrepSteps.map((step, i) => {
                  const active = vm.activeSection === step.id
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        className={`btn btn-sm rh-draft-prep-step${active ? ' active' : ''}`}
                        onClick={() => vm.setActiveSection(step.id)}
                      >
                        <span className="rh-draft-prep-num">{i + 1}</span>
                        {vm.t(step.labelKey)}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>
          ) : null}

          <ul
            className="nav nav-tabs rh-project-tabs flex-nowrap mb-3"
            role="tablist"
            aria-label={vm.t('projects.sectionNav')}
          >
            {vm.navSections.map((tab) => {
              const active = vm.activeSection === tab.id
              return (
                <li className="nav-item" key={tab.id} role="presentation">
                  <button
                    type="button"
                    className={`nav-link text-nowrap${active ? ' active' : ''}`}
                    role="tab"
                    id={`project-tab-${tab.id}`}
                    aria-selected={active}
                    aria-controls={`project-panel-${tab.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => vm.setActiveSection(tab.id)}
                  >
                    {vm.t(tab.labelKey)}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="rh-project-tab-panels">
            {vm.activeSection === 'proposal' ? (
              <div
                className="tab-pane"
                role="tabpanel"
                id="project-panel-proposal"
                aria-labelledby="project-tab-proposal"
              >
                <ProposalSection
                  projectId={vm.project.id}
                  project={vm.project}
                  canEdit={vm.canEdit}
                  onProjectChanged={() => void vm.refreshProject()}
                  onContinue={
                    vm.showDraftPrep ? vm.goToExperiments : undefined
                  }
                />
              </div>
            ) : null}

            {vm.activeSection === 'experiments' ? (
              <div
                className="tab-pane"
                role="tabpanel"
                id="project-panel-experiments"
                aria-labelledby="project-tab-experiments"
              >
                <ExperimentsSection
                  projectId={vm.project.id}
                  project={vm.project}
                  canEdit={vm.canEdit}
                  canAddPlanned={vm.canAddPlannedExperiment}
                  canAddExecuted={vm.canAddExecutedExperiment}
                  onProjectChanged={() => void vm.refreshProject()}
                  onContinue={
                    vm.showDraftPrep ? vm.goToPublications : undefined
                  }
                />
              </div>
            ) : null}

            {vm.activeSection === 'publications' ? (
              <div
                className="tab-pane"
                role="tabpanel"
                id="project-panel-publications"
                aria-labelledby="project-tab-publications"
              >
                <PublicationsSection
                  projectId={vm.project.id}
                  project={vm.project}
                  canEdit={vm.canEdit}
                  canAddExisting={vm.canAddExistingPublication}
                  canAddResulting={vm.canAddResultingPublication}
                  onContinue={vm.showDraftPrep ? vm.goToSubmit : undefined}
                />
              </div>
            ) : null}

            {vm.activeSection === 'submit' && vm.showDraftPrep ? (
              <div
                className="tab-pane"
                role="tabpanel"
                id="project-panel-submit"
                aria-labelledby="project-tab-submit"
              >
                <SubmitSection
                  projectId={vm.project.id}
                  project={vm.project}
                  canEdit={vm.canEdit}
                  onProjectChanged={() => void vm.refreshProject()}
                />
              </div>
            ) : null}
          </div>
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
