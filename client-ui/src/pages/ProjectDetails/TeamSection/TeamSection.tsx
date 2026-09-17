import { Form, Formik } from 'formik'
import { EmptyState } from '../../../components/EmptyState'
import { Popup } from '../../../components/Popup'
import { StatusBadge } from '../../../components/StatusBadge'
import { TextInput } from '../../../components/form/TextInput'
import type { InviteFormValues } from '../useProjectDetails'
import { useTeamSection, type TeamSectionProps } from './useTeamSection'

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

export function TeamSection(props: TeamSectionProps) {
  const vm = useTeamSection(props)

  return (
    <section className="rh-team">
      <div className="rh-team-header">
        {vm.showTitle ? (
          <h2 className="rh-team-title">{vm.t('projects.team')}</h2>
        ) : (
          <h2 className="rh-team-title">{vm.t('projects.collaborators')}</h2>
        )}
        {vm.isOwner ? (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={vm.openInvite}
          >
            {vm.t('projects.inviteTitle')}
          </button>
        ) : null}
      </div>

      <div className="rh-team-block">
        <h3 className="rh-team-block-title">
          {vm.t('projects.collaborators')}
        </h3>
        {vm.collaborators.length === 0 ? (
          <EmptyState compact message={vm.t('projects.collaboratorsEmpty')} />
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
            <h3 className="rh-team-block-title">
              {vm.t('projects.sentInvitations')}
            </h3>
            {vm.projectInvitations.length === 0 ? (
              <p className="rh-team-empty mb-0">
                {vm.t('projects.sentInvitationsEmpty')}
              </p>
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
                    <div className="d-flex flex-wrap align-items-center gap-1">
                      <span className={roleClass(inv.role)}>{inv.role}</span>
                      {inv.status === 'PENDING' ? (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm py-0 px-2"
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
                    required
                  />
                  <div className="rh-text-input">
                    <label className="form-label" htmlFor="role">
                      {vm.t('projects.inviteRole')}
                      <span className="rh-required-mark" aria-hidden="true">
                        *
                      </span>
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
                    <div className="rh-text-input-slot">{'\u00a0'}</div>
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
  )
}
