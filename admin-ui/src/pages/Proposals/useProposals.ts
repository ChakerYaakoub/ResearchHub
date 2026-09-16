import { useCallback, useEffect, useState } from 'react'
import {
  approveProposal,
  listProposals,
  rejectProposal,
  type AdminProposal,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export type ReviewKind = 'approve' | 'reject'
export type ProposalFilter = '' | 'PENDING' | 'APPROVED' | 'REJECTED'

export function useProposals() {
  const { access } = useAuth()
  const [filter, setFilter] = useState<ProposalFilter>('')
  const [proposals, setProposals] = useState<AdminProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [reviewKind, setReviewKind] = useState<ReviewKind | null>(null)
  const [pending, setPending] = useState<AdminProposal | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setProposals(await listProposals(access, filter || undefined))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setProposals([])
    } finally {
      setLoading(false)
    }
  }, [access, filter])

  useEffect(() => {
    void reload()
  }, [reload])

  function openReview(kind: ReviewKind, proposal: AdminProposal) {
    setActionError(null)
    setReviewComment('')
    setReviewKind(kind)
    setPending(proposal)
  }

  function closeReview() {
    if (busy) return
    setReviewKind(null)
    setPending(null)
    setReviewComment('')
  }

  async function confirmReview() {
    if (!access || !pending || !reviewKind) return
    setBusy(true)
    setActionError(null)
    try {
      if (reviewKind === 'approve') {
        await approveProposal(access, pending.id, reviewComment.trim())
      } else {
        await rejectProposal(access, pending.id, reviewComment.trim())
      }
      setReviewKind(null)
      setPending(null)
      setReviewComment('')
      await reload()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setBusy(false)
    }
  }

  return {
    copy,
    filter,
    setFilter,
    proposals,
    loading,
    error,
    actionError,
    reviewKind,
    pending,
    reviewComment,
    setReviewComment,
    busy,
    openReview,
    closeReview,
    confirmReview,
  }
}
