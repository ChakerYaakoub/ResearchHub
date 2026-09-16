import { Form, Formik } from 'formik'
import { EmptyState } from '../../../components/EmptyState'
import { LoadingState } from '../../../components/LoadingState'
import { StatusBadge } from '../../../components/StatusBadge'
import { ProposalSectionSkeleton } from './ProposalSectionSkeleton'
import {
  useProposalSection,
  type ProposalFormValues,
  type ProposalSectionProps,
} from './useProposalSection'

export function ProposalSection(props: ProposalSectionProps) {
  const vm = useProposalSection(props)

  return (
    <section className="border rounded p-3 mb-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h5 mb-0">{vm.t('proposal.title')}</h2>
        {vm.proposal ? (
          <StatusBadge
            status={vm.proposal.status}
            label={vm.t(`status.${vm.proposal.status}`)}
          />
        ) : null}
      </div>

      {vm.loading ? (
        <div className="position-relative py-2">
          <LoadingState overlay compact label={vm.t('common.loading')} />
          <ProposalSectionSkeleton />
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

      {!vm.loading && !vm.error && !vm.proposal && !vm.canMutate ? (
        <EmptyState compact message={vm.t('proposal.empty')} />
      ) : null}

      {!vm.loading && !vm.error && (vm.proposal || vm.canMutate) ? (
        vm.canMutate ? (
          <Formik<ProposalFormValues>
            enableReinitialize
            initialValues={vm.initialValues}
            validationSchema={vm.validationSchema}
            onSubmit={vm.onSave}
          >
            {({ isSubmitting, values, handleChange, handleBlur }) => (
              <Form noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="methodology">
                    {vm.t('proposal.methodology')}
                  </label>
                  <textarea
                    id="methodology"
                    name="methodology"
                    className="form-control"
                    rows={4}
                    value={values.methodology}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="expected_results">
                    {vm.t('proposal.expectedResults')}
                  </label>
                  <textarea
                    id="expected_results"
                    name="expected_results"
                    className="form-control"
                    rows={3}
                    value={values.expected_results}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSubmitting}
                  >
                    {vm.hasProposal
                      ? vm.t('proposal.save')
                      : vm.t('proposal.create')}
                  </button>
                  {vm.hasProposal ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={vm.submitting || isSubmitting}
                      onClick={() => void vm.onSubmitProposal()}
                    >
                      {vm.submitting
                        ? vm.t('proposal.submitting')
                        : vm.t('proposal.submit')}
                    </button>
                  ) : null}
                </div>
              </Form>
            )}
          </Formik>
        ) : vm.proposal ? (
          <div>
            <dl className="row mb-0">
              <dt className="col-sm-4">{vm.t('proposal.methodology')}</dt>
              <dd className="col-sm-8">
                {vm.proposal.methodology || (
                  <span className="text-muted">—</span>
                )}
              </dd>
              <dt className="col-sm-4">{vm.t('proposal.expectedResults')}</dt>
              <dd className="col-sm-8">
                {vm.proposal.expected_results || (
                  <span className="text-muted">—</span>
                )}
              </dd>
              {vm.proposal.submitted_at ? (
                <>
                  <dt className="col-sm-4">{vm.t('proposal.submittedAt')}</dt>
                  <dd className="col-sm-8">
                    {new Date(vm.proposal.submitted_at).toLocaleString()}
                  </dd>
                </>
              ) : null}
              {vm.proposal.reviewed_at ? (
                <>
                  <dt className="col-sm-4">{vm.t('proposal.reviewedAt')}</dt>
                  <dd className="col-sm-8">
                    {new Date(vm.proposal.reviewed_at).toLocaleString()}
                  </dd>
                </>
              ) : null}
              {vm.proposal.review_comment ? (
                <>
                  <dt className="col-sm-4">{vm.t('proposal.reviewComment')}</dt>
                  <dd className="col-sm-8">{vm.proposal.review_comment}</dd>
                </>
              ) : null}
            </dl>
          </div>
        ) : null
      ) : null}
    </section>
  )
}
