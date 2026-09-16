import { Form, Formik } from 'formik'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { EmptyState } from '../../../components/EmptyState'
import { LoadingState } from '../../../components/LoadingState'
import { Popup } from '../../../components/Popup'
import { StatusBadge } from '../../../components/StatusBadge'
import { ExperimentsSectionSkeleton } from './ExperimentsSectionSkeleton'
import {
  useExperimentsSection,
  type ExperimentFormValues,
  type ExperimentsSectionProps,
} from './useExperimentsSection'

export function ExperimentsSection(props: ExperimentsSectionProps) {
  const vm = useExperimentsSection(props)

  return (
    <section className="border rounded p-3 mb-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h5 mb-0">{vm.t('experiments.title')}</h2>
        {vm.canEdit ? (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={vm.openCreate}
          >
            {vm.t('experiments.add')}
          </button>
        ) : null}
      </div>

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

      {!vm.loading && !vm.error && vm.items.length === 0 ? (
        <EmptyState compact message={vm.t('experiments.empty')} />
      ) : null}

      {!vm.loading && vm.items.length > 0 ? (
        <ul className="list-group">
          {vm.items.map((exp) => (
            <li
              key={exp.id}
              className="list-group-item d-flex flex-column flex-md-row justify-content-md-between gap-2"
            >
              <div>
                <div className="fw-semibold">{exp.instrument}</div>
                <div className="small text-muted">
                  {new Date(exp.scheduled_date).toLocaleString()}
                </div>
                {exp.notes ? (
                  <div className="small mt-1">{exp.notes}</div>
                ) : null}
              </div>
              <div className="d-flex flex-wrap align-items-start gap-2">
                <StatusBadge
                  status={exp.status}
                  label={vm.t(`status.${exp.status}`)}
                />
                {vm.canEdit ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => vm.openEdit(exp.id)}
                    >
                      {vm.t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => vm.requestDelete(exp.id)}
                    >
                      {vm.t('common.delete')}
                    </button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Popup
        open={vm.showForm && vm.canEdit}
        onClose={vm.closeForm}
        title={
          vm.editingId ? vm.t('experiments.edit') : vm.t('experiments.add')
        }
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
            errors,
            touched,
          }) => (
            <Form noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="instrument">
                  {vm.t('experiments.instrument')}
                </label>
                <input
                  id="instrument"
                  name="instrument"
                  className={`form-control${touched.instrument && errors.instrument ? ' is-invalid' : ''}`}
                  value={values.instrument}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
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
