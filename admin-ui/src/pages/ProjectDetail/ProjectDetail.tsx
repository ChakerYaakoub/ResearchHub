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

      {vm.loading || !p ? (
        <LoadingState label={vm.copy.loading} />
      ) : (
        <>
          <article className="rh-admin-item-card mb-4">
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

          <section className="rh-admin-item-card mb-4">
            <h3 className="h5 mb-3">{vm.copy.sectionProposal}</h3>
            {!p.proposal ? (
              <p className="small text-muted mb-0">{vm.copy.emptyProposal}</p>
            ) : (
              <dl className="row small mb-0">
                <dt className="col-sm-3">{vm.copy.status}</dt>
                <dd className="col-sm-9">
                  <StatusBadge status={p.proposal.status} />
                </dd>
                <dt className="col-sm-3">{vm.copy.methodology}</dt>
                <dd className="col-sm-9">{p.proposal.methodology}</dd>
                <dt className="col-sm-3">{vm.copy.expectedResults}</dt>
                <dd className="col-sm-9">{p.proposal.expected_results}</dd>
                <dt className="col-sm-3">{vm.copy.submittedAt}</dt>
                <dd className="col-sm-9">
                  {p.proposal.submitted_at
                    ? new Date(p.proposal.submitted_at).toLocaleString()
                    : vm.copy.none}
                </dd>
                <dt className="col-sm-3">{vm.copy.reviewedAt}</dt>
                <dd className="col-sm-9">
                  {p.proposal.reviewed_at
                    ? new Date(p.proposal.reviewed_at).toLocaleString()
                    : vm.copy.none}
                </dd>
                <dt className="col-sm-3">{vm.copy.reviewComment}</dt>
                <dd className="col-sm-9 mb-0">
                  {p.proposal.review_comment || vm.copy.none}
                </dd>
              </dl>
            )}
          </section>

          <section className="rh-admin-item-card mb-4">
            <h3 className="h5 mb-3">{vm.copy.sectionTeam}</h3>
            {p.members.length === 0 ? (
              <p className="small text-muted mb-0">{vm.copy.emptyMembers}</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {p.members.map((m) => (
                  <li
                    key={`${m.email}-${m.role}`}
                    className="d-flex flex-wrap justify-content-between gap-2 py-2 border-bottom border-light"
                  >
                    <span className="text-break">{m.email}</span>
                    <StatusBadge status={m.role} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rh-admin-item-card mb-4">
            <h3 className="h5 mb-3">{vm.copy.sectionExperiments}</h3>
            {p.experiments.length === 0 ? (
              <p className="small text-muted mb-0">{vm.copy.emptyExperiments}</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {p.experiments.map((ex) => (
                  <li
                    key={ex.id}
                    className="py-2 border-bottom border-light small"
                  >
                    <div className="d-flex flex-wrap justify-content-between gap-2 mb-1">
                      <strong>
                        {ex.instrument_code || ex.instrument_name || vm.copy.instrument}
                      </strong>
                      <StatusBadge status={ex.status} />
                    </div>
                    <p className="mb-0 text-muted">
                      {ex.installation_name ? `${ex.installation_name} · ` : ''}
                      {ex.scheduled_date
                        ? new Date(ex.scheduled_date).toLocaleDateString()
                        : vm.copy.none}
                      {ex.kind ? ` · ${ex.kind}` : ''}
                    </p>
                    {ex.notes ? <p className="mb-0 mt-1">{ex.notes}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rh-admin-item-card mb-4">
            <h3 className="h5 mb-3">{vm.copy.sectionPublications}</h3>
            {p.publications.length === 0 ? (
              <p className="small text-muted mb-0">
                {vm.copy.emptyPublicationsSection}
              </p>
            ) : (
              <ul className="list-unstyled mb-0">
                {p.publications.map((pub) => (
                  <li
                    key={pub.id}
                    className="py-2 border-bottom border-light small"
                  >
                    <div className="d-flex flex-wrap justify-content-between gap-2 mb-1">
                      <strong>{pub.title}</strong>
                      {pub.kind ? <StatusBadge status={pub.kind} /> : null}
                    </div>
                    <p className="mb-0 text-muted">
                      {pub.authors}
                      {pub.journal ? ` · ${pub.journal}` : ''}
                      {pub.doi ? ` · ${pub.doi}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rh-admin-item-card mb-4">
            <h3 className="h5 mb-3">{vm.copy.sectionInvitations}</h3>
            {p.invitations.length === 0 ? (
              <p className="small text-muted mb-0">
                {vm.copy.emptyInvitationsSection}
              </p>
            ) : (
              <ul className="list-unstyled mb-0">
                {p.invitations.map((inv) => (
                  <li
                    key={inv.id}
                    className="d-flex flex-wrap justify-content-between gap-2 py-2 border-bottom border-light small"
                  >
                    <div>
                      <span className="text-break">{inv.email}</span>
                      <span className="text-muted">
                        {' '}
                        · {inv.role} ·{' '}
                        {new Date(inv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <StatusBadge status={inv.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
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
