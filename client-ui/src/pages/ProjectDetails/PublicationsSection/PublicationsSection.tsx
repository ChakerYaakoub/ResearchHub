import { Form, Formik } from 'formik'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { LoadingState } from '../../../components/LoadingState'
import { Popup } from '../../../components/Popup'
import type { Publication } from '../../../types/api'
import { PublicationsSectionSkeleton } from './PublicationsSectionSkeleton'
import {
  usePublicationsSection,
  type PublicationFormValues,
  type PublicationsSectionProps,
} from './usePublicationsSection'

function PublicationRow({
  pub,
  canMutate,
  onEdit,
  onDelete,
  t,
}: {
  pub: Publication
  canMutate: boolean
  onEdit: () => void
  onDelete: () => void
  t: (key: string) => string
}) {
  const kindClass =
    pub.kind === 'RESULTING' ? 'text-bg-primary' : 'text-bg-secondary'

  return (
    <li className="list-group-item d-flex flex-column flex-md-row justify-content-md-between gap-2">
      <div>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <span className="fw-semibold">{pub.title}</span>
          <span className={`badge ${kindClass}`}>
            {t(`publications.kind.${pub.kind}`)}
          </span>
        </div>
        <div className="small text-muted">{pub.authors}</div>
        {pub.journal ? <div className="small">{pub.journal}</div> : null}
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
      {canMutate ? (
        <div className="d-flex flex-wrap align-items-start gap-2">
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
        </div>
      ) : null}
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
  items: Publication[]
  canMutateItem: (pub: Publication) => boolean
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
          {items.map((pub) => (
            <PublicationRow
              key={pub.id}
              pub={pub}
              canMutate={canMutateItem(pub)}
              onEdit={() => onEdit(pub.id)}
              onDelete={() => onDelete(pub.id)}
              t={t}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export function PublicationsSection(props: PublicationsSectionProps) {
  const vm = usePublicationsSection(props)

  return (
    <section className="border rounded p-3 mb-4 bg-white">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <h2 className="h5 mb-0">{vm.t('publications.title')}</h2>
        <div className="d-flex flex-wrap gap-2">
          {vm.canAddExisting ? (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => vm.openCreate('EXISTING')}
            >
              {vm.t('publications.addExisting')}
            </button>
          ) : null}
          {vm.canAddResulting ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => vm.openCreate('RESULTING')}
            >
              {vm.t('publications.addResulting')}
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

      {!vm.loading && !vm.error ? (
        <>
          <KindGroup
            heading={vm.t('publications.existingHeading')}
            emptyMessage={vm.existingEmpty}
            items={vm.existingItems}
            canMutateItem={vm.canMutateItem}
            onEdit={vm.openEdit}
            onDelete={vm.requestDelete}
            t={vm.t}
          />
          {vm.showResultingGroup ? (
            <KindGroup
              heading={vm.t('publications.resultingHeading')}
              emptyMessage={vm.resultingEmpty}
              items={vm.resultingItems}
              canMutateItem={vm.canMutateItem}
              onEdit={vm.openEdit}
              onDelete={vm.requestDelete}
              t={vm.t}
            />
          ) : null}
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

      {vm.showContinue && vm.onContinue ? (
        <div className="mt-3 pt-3 border-top">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={vm.onContinue}
          >
            {vm.t('projects.draftPrep.continueSubmit')}
          </button>
        </div>
      ) : null}
    </section>
  )
}
