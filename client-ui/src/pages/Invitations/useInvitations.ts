import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../api/client'
import {
  acceptInvitation,
  declineInvitation,
  listMyInvitations,
} from '../../api/invitations'
import { useAuth } from '../../auth'
import {
  clearInviteToken,
  getInviteToken,
} from '../../auth/inviteTokenStorage'
import { notifyError, notifySuccess } from '../../notify'
import type { Invitation } from '../../types/api'

/**
 * Authenticated `/invitations`: list mine + accept/decline by token.
 * Highlights invite from deep-link storage; clears token on leave / after action.
 */
export function useInvitations() {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyToken, setBusyToken] = useState<string | null>(null)
  const [highlightToken] = useState(() => getInviteToken())

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

  useEffect(() => {
    return () => {
      clearInviteToken()
    }
  }, [])

  const pending = invitations.filter((i) => i.status === 'PENDING')

  async function onAccept(invite: Invitation) {
    if (!access || !invite.token) return
    setBusyToken(invite.token)
    try {
      await acceptInvitation(access, invite.token)
      clearInviteToken()
      notifySuccess(t('toast.accepted'))
      await reload()
    } catch (err) {
      notifyError(
        err instanceof ApiError ? err.message : t('errors.acceptFailed'),
      )
    } finally {
      setBusyToken(null)
    }
  }

  async function onDecline(invite: Invitation) {
    if (!access || !invite.token) return
    setBusyToken(invite.token)
    try {
      await declineInvitation(access, invite.token)
      clearInviteToken()
      notifySuccess(t('toast.declined'))
      await reload()
    } catch (err) {
      notifyError(
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
    busyToken,
    highlightToken,
    onAccept,
    onDecline,
  }
}
