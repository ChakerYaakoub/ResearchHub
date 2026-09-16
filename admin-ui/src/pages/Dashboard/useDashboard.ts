import { useCallback, useEffect, useState } from 'react'
import {
  approveProposal,
  getAdminStats,
  listPendingProposals,
  rejectProposal,
  type AdminProposal,
  type AdminStats,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export type ReviewKind = 'approve' | 'reject'

const STAT_CARDS: { key: keyof AdminStats; label: string }[] = [
  { key: 'total_projects', label: copy.totalProjects },
  { key: 'pending_proposals', label: copy.pendingProposals },
  { key: 'scheduled_experiments', label: copy.scheduledExperiments },
  { key: 'completed_projects', label: copy.completedProjects },
  { key: 'researchers', label: copy.researchers },
  { key: 'pending_invitations', label: copy.pendingInvitations },
  { key: 'publications', label: copy.publications },
]

export function useDashboard() {
  const { access } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
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
      const [s, p] = await Promise.all([
        getAdminStats(access),
        listPendingProposals(access),
      ])
      setStats(s)
      setProposals(p)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setStats(null)
      setProposals([])
    } finally {
      setLoading(false)
    }
  }, [access])

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

  const cards = STAT_CARDS.map((c) => ({
    key: c.key,
    label: c.label,
    value: stats ? stats[c.key] : '—',
  }))

  return {
    copy,
    cards,
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
