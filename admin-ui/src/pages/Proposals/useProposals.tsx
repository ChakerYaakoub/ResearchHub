import { useCallback, useEffect, useState } from 'react'
import {
  approveProposal,
  listProposals,
  rejectProposal,
  type AdminProposal,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { AdminListFilters } from '../../components/AdminListFilters'
import { useAuth } from '../../auth'
import { copy } from '../../copy'
import { useAdminListParams } from '../../hooks/useAdminListParams'
import { notifyError, notifySuccess } from '../../notify'

export type ReviewKind = 'approve' | 'reject'
export type ProposalFilter = '' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'

export function useProposals() {
  const { access } = useAuth()
  const listParams = useAdminListParams({ status: 'PENDING' })
  const filter = (listParams.status || '') as ProposalFilter
  const [proposals, setProposals] = useState<AdminProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewKind, setReviewKind] = useState<ReviewKind | null>(null)
  const [pending, setPending] = useState<AdminProposal | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    if (!access) return
    setLoading(true)
    setError(null)
    try {
      setProposals(
        await listProposals(access, {
          status: listParams.filters.status,
          search: listParams.filters.search,
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : copy.loadFailed)
      setProposals([])
    } finally {
      setLoading(false)
    }
  }, [access, listParams.filters.search, listParams.filters.status])

  useEffect(() => {
    void reload()
  }, [reload])

  function openReview(kind: ReviewKind, proposal: AdminProposal) {
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
    try {
      if (reviewKind === 'approve') {
        await approveProposal(access, pending.id, reviewComment.trim())
        notifySuccess(copy.proposalApproved)
      } else {
        await rejectProposal(access, pending.id, reviewComment.trim())
        notifySuccess(copy.proposalRejected)
      }
      setReviewKind(null)
      setPending(null)
      setReviewComment('')
      await reload()
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : copy.requestFailed)
    } finally {
      setBusy(false)
    }
  }

  const searchUi =
    !loading && (proposals.length > 0 || listParams.hasActiveFilters) ? (
    <AdminListFilters
      searchInput={listParams.searchInput}
      onSearchChange={listParams.setSearchInput}
      searchPlaceholder={copy.searchProposals}
    />
  ) : null

  return {
    copy,
    filter,
    setFilter: (v: ProposalFilter) => listParams.setStatus(v),
    proposals,
    loading,
    error,
    reviewKind,
    pending,
    reviewComment,
    setReviewComment,
    busy,
    openReview,
    closeReview,
    confirmReview,
    searchUi,
  }
}
