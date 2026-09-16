import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../api/client'
import {
  acceptInvitation,
  declineInvitation,
  listMyInvitations,
} from '../../api/invitations'
import { useAuth } from '../../auth'
import type { Invitation } from '../../types/api'

/** My invitations list + accept/decline actions. */
export function useInvitations() {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyToken, setBusyToken] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      const data = await listMyInvitations(access)
      setInvitations(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [access, t])

  useEffect(() => {
    void reload()
  }, [reload])

  const pending = invitations.filter((i) => i.status === 'PENDING')

  async function onAccept(invite: Invitation) {
    if (!access || !invite.token) return
    setActionError(null)
    setBusyToken(invite.token)
    try {
      await acceptInvitation(access, invite.token)
      await reload()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t('errors.acceptFailed'),
      )
    } finally {
      setBusyToken(null)
    }
  }

  async function onDecline(invite: Invitation) {
    if (!access || !invite.token) return
    setActionError(null)
    setBusyToken(invite.token)
    try {
      await declineInvitation(access, invite.token)
      await reload()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t('errors.declineFailed'),
      )
    } finally {
      setBusyToken(null)
    }
  }

  return {
    t,
    invitations,
    pending,
    loading,
    error,
    actionError,
    busyToken,
    onAccept,
    onDecline,
  }
}
