import { Form, Formik } from 'formik'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { EmptyState } from '../../../components/EmptyState'
import { LoadingState } from '../../../components/LoadingState'
import { Popup } from '../../../components/Popup'
import { PublicationsSectionSkeleton } from './PublicationsSectionSkeleton'
import {
  usePublicationsSection,
  type PublicationFormValues,
  type PublicationsSectionProps,
} from './usePublicationsSection'

export function PublicationsSection(props: PublicationsSectionProps) {
  const vm = usePublicationsSection(props)

  return (
    <section className="border rounded p-3 mb-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h5 mb-0">{vm.t('publications.title')}</h2>
        {vm.canEdit ? (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={vm.openCreate}
          >
            {vm.t('publications.add')}
          </button>
        ) : null}
      </div>

      {vm.loading ? (
        <div className="position-relative py-2">
          <LoadingState overlay compact label={vm.t('common.loading')} />
          <PublicationsSectionSkeleton />
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
        <EmptyState compact message={vm.t('publications.empty')} />
      ) : null}

      {!vm.loading && vm.items.length > 0 ? (
        <ul className="list-group">
          {vm.items.map((pub) => (
            <li
              key={pub.id}
              className="list-group-item d-flex flex-column flex-md-row justify-content-md-between gap-2"
            >
              <div>
                <div className="fw-semibold">{pub.title}</div>
                <div className="small text-muted">{pub.authors}</div>
                {pub.journal ? (
                  <div className="small">{pub.journal}</div>
                ) : null}
                {pub.url ? (
                  <a
                    className="small"
                    href={pub.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {pub.url}
                  </a>
                ) : null}
              </div>
              {vm.canEdit ? (
                <div className="d-flex flex-wrap align-items-start gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => vm.openEdit(pub.id)}
                  >
                    {vm.t('common.edit')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => vm.requestDelete(pub.id)}
                  >
                    {vm.t('common.delete')}
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <Popup
        open={vm.showForm && vm.canEdit}
        onClose={vm.closeForm}
        title={
          vm.editingId
            ? vm.t('publications.edit')
            : vm.t('publications.add')
        }
        size="md"
      >
        {vm.actionError ? (
          <div className="alert alert-danger py-2" role="alert">
            {vm.actionError}
          </div>
        ) : null}
        <Formik<PublicationFormValues>
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
                <label className="form-label" htmlFor="pub-title">
                  {vm.t('publications.fieldTitle')}
                </label>
                <input
                  id="pub-title"
                  name="title"
                  className={`form-control${touched.title && errors.title ? ' is-invalid' : ''}`}
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.title && errors.title ? (
                  <div className="invalid-feedback">{errors.title}</div>
                ) : null}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="authors">
                  {vm.t('publications.authors')}
                </label>
                <input
                  id="authors"
                  name="authors"
                  className={`form-control${touched.authors && errors.authors ? ' is-invalid' : ''}`}
                  value={values.authors}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.authors && errors.authors ? (
                  <div className="invalid-feedback">{errors.authors}</div>
                ) : null}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="journal">
                  {vm.t('publications.journal')}
                </label>
                <input
                  id="journal"
                  name="journal"
                  className="form-control"
                  value={values.journal}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
              <div className="row g-2">
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="doi">
                    {vm.t('publications.doi')}
                  </label>
                  <input
                    id="doi"
                    name="doi"
                    className="form-control"
                    value={values.doi}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="publication_date">
                    {vm.t('publications.date')}
                  </label>
                  <input
                    id="publication_date"
                    name="publication_date"
                    type="date"
                    className="form-control"
                    value={values.publication_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="url">
                  {vm.t('publications.url')}
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  className="form-control"
                  value={values.url}
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
        title={vm.t('publications.deleteTitle')}
        message={vm.t('publications.confirmDelete')}
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
