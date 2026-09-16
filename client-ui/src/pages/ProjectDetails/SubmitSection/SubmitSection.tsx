import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { LoadingState } from '../../../components/LoadingState'
import { useSubmitSection, type SubmitSectionProps } from './useSubmitSection'

/** Draft-only review & submit panel. */
export function SubmitSection(props: SubmitSectionProps) {
  const vm = useSubmitSection(props)

  return (
    <section className="border rounded p-3 mb-4 bg-white">
      <h2 className="h5 mb-2">{vm.t('projects.draftPrep.submitTitle')}</h2>
      <p className="text-muted mb-3">
        {vm.t('projects.draftPrep.checklistTitle')}
      </p>

      {vm.loading ? (
        <div className="position-relative py-4">
          <LoadingState overlay compact label={vm.t('common.loading')} />
        </div>
      ) : null}

      {vm.error ? (
        <div className="alert alert-danger py-2" role="alert">
          {vm.error}
        </div>
      ) : null}
      {vm.actionError ? (
        <div className="alert alert-danger py-2" role="alert">
          {vm.actionError}
        </div>
      ) : null}

      {!vm.loading && !vm.error ? (
        <>
          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item px-0 d-flex justify-content-between gap-2">
              <span>{vm.t('projects.draftPrep.checklistProposal')}</span>
              <span
                className={
                  vm.hasProposal ? 'text-success fw-semibold' : 'text-danger'
                }
              >
                {vm.hasProposal
                  ? vm.t('projects.draftPrep.checklistReady')
                  : vm.t('projects.draftPrep.checklistProposalMissing')}
              </span>
            </li>
            <li className="list-group-item px-0 d-flex justify-content-between gap-2">
              <span>
                {vm.t('projects.draftPrep.checklistExperiments', {
                  count: vm.plannedCount,
                })}
              </span>
              <span className="text-muted small">
                {vm.t('projects.draftPrep.checklistRecommended')}
              </span>
            </li>
            <li className="list-group-item px-0 d-flex justify-content-between gap-2">
              <span>
                {vm.t('projects.draftPrep.checklistPublications', {
                  count: vm.existingCount,
                })}
              </span>
              <span className="text-muted small">
                {vm.t('projects.draftPrep.checklistRecommended')}
              </span>
            </li>
          </ul>

          <div className="alert alert-warning" role="status">
            {vm.t('projects.draftPrep.freezeWarning')}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!vm.canSubmit || vm.submitting}
            onClick={vm.openConfirm}
          >
            {vm.submitting
              ? vm.t('proposal.submitting')
              : vm.t('proposal.submit')}
          </button>
        </>
      ) : null}

      <ConfirmDialog
        open={vm.confirmOpen}
        title={vm.t('projects.draftPrep.confirmTitle')}
        message={vm.t('projects.draftPrep.confirmMessage')}
        confirmLabel={vm.t('proposal.submit')}
        cancelLabel={vm.t('common.cancel')}
        busy={vm.submitting}
        busyLabel={vm.t('proposal.submitting')}
        onConfirm={() => void vm.onConfirmSubmit()}
        onClose={vm.closeConfirm}
      />
    </section>
  )
}
