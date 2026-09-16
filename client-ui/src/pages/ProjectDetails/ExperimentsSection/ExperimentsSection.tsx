import { Form, Formik } from 'formik'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { LoadingState } from '../../../components/LoadingState'
import { Popup } from '../../../components/Popup'
import { StatusBadge } from '../../../components/StatusBadge'
import type { Experiment } from '../../../types/api'
import { ExperimentsSectionSkeleton } from './ExperimentsSectionSkeleton'
import {
  useExperimentsSection,
  type ExperimentFormValues,
  type ExperimentsSectionProps,
} from './useExperimentsSection'

function ExperimentRow({
  exp,
  canMutate,
  onEdit,
  onDelete,
  t,
}: {
  exp: Experiment
  canMutate: boolean
  onEdit: () => void
  onDelete: () => void
  t: (key: string) => string
}) {
  const kindClass =
    exp.kind === 'EXECUTED' ? 'text-bg-primary' : 'text-bg-secondary'

  return (
    <li className="list-group-item d-flex flex-column flex-md-row justify-content-md-between gap-2">
      <div>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <span className="fw-semibold">
            {exp.instrument_code} · {exp.instrument_name}
          </span>
          <span className={`badge ${kindClass}`}>
            {t(`experiments.kind.${exp.kind}`)}
          </span>
        </div>
        <div className="small text-muted">
          {exp.installation_name} ·{' '}
          {new Date(exp.scheduled_date).toLocaleString()}
        </div>
        {exp.notes ? <div className="small mt-1">{exp.notes}</div> : null}
      </div>
      <div className="d-flex flex-wrap align-items-start gap-2">
        <StatusBadge status={exp.status} label={t(`status.${exp.status}`)} />
        {canMutate ? (
          <>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={onEdit}
            >
              {t('common.edit')}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={onDelete}
            >
              {t('common.delete')}
            </button>
          </>
        ) : null}
      </div>
    </li>
  )
}

function KindGroup({
  heading,
  emptyMessage,
  items,
  canMutateItem,
  onEdit,
  onDelete,
  t,
}: {
  heading: string
  emptyMessage: string
  items: Experiment[]
  canMutateItem: (exp: Experiment) => boolean
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  t: (key: string) => string
}) {
  return (
    <div className="mb-3">
      <h3 className="h6 text-muted mb-2">{heading}</h3>
      {items.length === 0 ? (
        <p className="small text-muted mb-0">{emptyMessage}</p>
      ) : (
        <ul className="list-group">
          {items.map((exp) => (
            <ExperimentRow
              key={exp.id}
              exp={exp}
              canMutate={canMutateItem(exp)}
              onEdit={() => onEdit(exp.id)}
              onDelete={() => onDelete(exp.id)}
              t={t}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export function ExperimentsSection(props: ExperimentsSectionProps) {
  const vm = useExperimentsSection(props)

  return (
    <section className="border rounded p-3 mb-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h2 className="h5 mb-0">{vm.t('experiments.title')}</h2>
        <div className="d-flex flex-wrap gap-2">
          {vm.canAddPlanned ? (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => vm.openCreate('PLANNED')}
            >
              {vm.t('experiments.addPlanned')}
            </button>
          ) : null}
          {vm.canAddExecuted ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => vm.openCreate('EXECUTED')}
            >
              {vm.t('experiments.addExecuted')}
            </button>
          ) : null}
        </div>
      </div>

      {vm.phaseHint ? (
        <p className="small text-muted mb-3">{vm.phaseHint}</p>
      ) : null}

      {vm.loading ? (
        <div className="position-relative py-2">
          <LoadingState overlay compact label={vm.t('common.loading')} />
          <ExperimentsSectionSkeleton />
        </div>
      ) : null}
      {vm.error ? (
        <div className="alert alert-danger py-2" role="alert">
          {vm.error}
        </div>
      ) : null}
      {vm.actionError && !vm.showForm ? (
        <div className="alert alert-danger py-2" role="alert">
          {vm.actionError}
        </div>
      ) : null}

      {!vm.loading && !vm.error ? (
        <>
          <KindGroup
            heading={vm.t('experiments.plannedHeading')}
            emptyMessage={vm.plannedEmpty}
            items={vm.plannedItems}
            canMutateItem={vm.canMutateItem}
            onEdit={vm.openEdit}
            onDelete={vm.requestDelete}
            t={vm.t}
          />
          <KindGroup
            heading={vm.t('experiments.executedHeading')}
            emptyMessage={vm.executedEmpty}
            items={vm.executedItems}
            canMutateItem={vm.canMutateItem}
            onEdit={vm.openEdit}
            onDelete={vm.requestDelete}
            t={vm.t}
          />
        </>
      ) : null}

      <Popup
        open={vm.showForm && vm.formKind != null}
        onClose={vm.closeForm}
        title={vm.formTitle}
        size="md"
      >
        {vm.actionError ? (
          <div className="alert alert-danger py-2" role="alert">
            {vm.actionError}
          </div>
        ) : null}
        <Formik<ExperimentFormValues>
          enableReinitialize
          initialValues={vm.initialValues}
          validationSchema={vm.validationSchema}
          onSubmit={vm.onSave}
        >
          {({
            isSubmitting,
            values,
            handleChange,
            handleBlur,
            setFieldValue,
            errors,
            touched,
          }) => (
            <Form noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="installation_id">
                  {vm.t('experiments.installation')}
                </label>
                <select
                  id="installation_id"
                  name="installation_id"
                  className={`form-select${touched.installation_id && errors.installation_id ? ' is-invalid' : ''}`}
                  value={values.installation_id}
                  onChange={(e) => {
                    const next = e.target.value
                    void setFieldValue('installation_id', next)
                    void setFieldValue('instrument', '')
                    vm.setFormInstallationId(next)
                  }}
                  onBlur={handleBlur}
                >
                  <option value="">
                    {vm.t('experiments.selectInstallation')}
                  </option>
                  {vm.installations.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
                {touched.installation_id && errors.installation_id ? (
                  <div className="invalid-feedback">
                    {errors.installation_id}
                  </div>
                ) : null}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="instrument">
                  {vm.t('experiments.instrument')}
                </label>
                <select
                  id="instrument"
                  name="instrument"
                  className={`form-select${touched.instrument && errors.instrument ? ' is-invalid' : ''}`}
                  value={values.instrument}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!values.installation_id}
                >
                  <option value="">
                    {vm.t('experiments.selectInstrument')}
                  </option>
                  {vm.instrumentsForForm.map((instr) => (
                    <option key={instr.id} value={instr.id}>
                      {instr.code} · {instr.name}
                    </option>
                  ))}
                </select>
                {touched.instrument && errors.instrument ? (
                  <div className="invalid-feedback">{errors.instrument}</div>
                ) : null}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="scheduled_date">
                  {vm.t('experiments.scheduledDate')}
                </label>
                <input
                  id="scheduled_date"
                  name="scheduled_date"
                  type="datetime-local"
                  className={`form-control${touched.scheduled_date && errors.scheduled_date ? ' is-invalid' : ''}`}
                  value={values.scheduled_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.scheduled_date && errors.scheduled_date ? (
                  <div className="invalid-feedback">
                    {errors.scheduled_date}
                  </div>
                ) : null}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="status">
                  {vm.t('experiments.status')}
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={values.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  {vm.statuses.map((s) => (
                    <option key={s} value={s}>
                      {vm.t(`status.${s}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="notes">
                  {vm.t('experiments.notes')}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  rows={2}
                  value={values.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <div className="d-flex flex-wrap justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={isSubmitting}
                  onClick={vm.closeForm}
                >
                  {vm.t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}
                >
                  {vm.t('common.save')}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Popup>

      <ConfirmDialog
        open={vm.pendingDeleteId != null}
        title={vm.t('experiments.deleteTitle')}
        message={vm.t('experiments.confirmDelete')}
        confirmLabel={vm.t('common.delete')}
        cancelLabel={vm.t('common.cancel')}
        busy={vm.deleting}
        busyLabel={vm.t('common.deleting')}
        danger
        onConfirm={() => void vm.confirmDelete()}
        onClose={vm.closeDeleteConfirm}
      />
    </section>
  )
}
