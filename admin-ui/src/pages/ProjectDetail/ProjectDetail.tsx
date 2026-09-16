import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useProjectDetail } from './useProjectDetail'
import '../../styles/adminLists.css'

export function ProjectDetailPage() {
  const vm = useProjectDetail()
  const p = vm.project

  return (
    <div className="container-fluid px-3 px-md-4 py-4 rh-admin-panel">
      <Link to="/projects" className="btn btn-link btn-sm px-0 mb-3">
        ← {vm.copy.backToProjects}
      </Link>

      {vm.error ? (
        <div className="alert alert-danger" role="alert">
          {vm.error}
        </div>
      ) : null}
      {vm.actionError ? (
        <div className="alert alert-danger" role="alert">
          {vm.actionError}
        </div>
      ) : null}

      {vm.loading || !p ? (
        <LoadingState label={vm.copy.loading} />
      ) : (
        <article className="rh-admin-item-card">
          <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
            <h2 className="h4 mb-0">{p.title}</h2>
            <StatusBadge status={p.status} />
          </div>
          <dl className="row small mb-4">
            <dt className="col-sm-3">{vm.copy.owner}</dt>
            <dd className="col-sm-9">{p.owner_email}</dd>
            <dt className="col-sm-3">{vm.copy.description}</dt>
            <dd className="col-sm-9">
              {p.description || vm.copy.none}
            </dd>
            <dt className="col-sm-3">{vm.copy.scientificObjective}</dt>
            <dd className="col-sm-9">
              {p.scientific_objective || vm.copy.none}
            </dd>
            <dt className="col-sm-3">{vm.copy.proposalStatus}</dt>
            <dd className="col-sm-9">
              {p.proposal_status ? (
                <StatusBadge status={p.proposal_status} />
              ) : (
                vm.copy.none
              )}
            </dd>
            <dt className="col-sm-3">{vm.copy.members}</dt>
            <dd className="col-sm-9">{p.member_count}</dd>
            <dt className="col-sm-3">{vm.copy.experimentCount}</dt>
            <dd className="col-sm-9">{p.experiment_count}</dd>
            <dt className="col-sm-3">{vm.copy.publicationCount}</dt>
            <dd className="col-sm-9">{p.publication_count}</dd>
            <dt className="col-sm-3">{vm.copy.pendingInviteCount}</dt>
            <dd className="col-sm-9">{p.pending_invitation_count}</dd>
            <dt className="col-sm-3">{vm.copy.createdAt}</dt>
            <dd className="col-sm-9">
              {new Date(p.created_at).toLocaleString()}
            </dd>
            <dt className="col-sm-3">{vm.copy.updatedAt}</dt>
            <dd className="col-sm-9 mb-0">
              {new Date(p.updated_at).toLocaleString()}
            </dd>
          </dl>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => vm.setConfirmOpen(true)}
          >
            {vm.copy.deleteProject}
          </button>
        </article>
      )}

      <ConfirmDialog
        open={vm.confirmOpen}
        title={vm.copy.deleteProjectTitle}
        message={vm.copy.deleteProjectMessage}
        confirmLabel={vm.copy.deleteProject}
        cancelLabel={vm.copy.cancel}
        busy={vm.busy}
        busyLabel={vm.copy.deleting}
        danger
        onConfirm={() => void vm.confirmDelete()}
        onClose={() => {
          if (!vm.busy) vm.setConfirmOpen(false)
        }}
      />
    </div>
  )
}
