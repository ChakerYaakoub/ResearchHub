import { useCallback, useEffect, useState } from 'react'
import {
  getAdminStats,
  listPendingProposals,
  type AdminProposal,
  type AdminStats,
} from '../../api/admin'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

const STAT_CARDS: {
  key: keyof AdminStats
  label: string
  to: string
}[] = [
  { key: 'total_projects', label: copy.totalProjects, to: '/projects' },
  {
    key: 'pending_proposals',
    label: copy.pendingProposals,
    to: '/proposals?status=PENDING',
  },
  {
    key: 'scheduled_experiments',
    label: copy.scheduledExperiments,
    to: '/projects?status=IN_PROGRESS',
  },
  {
    key: 'completed_projects',
    label: copy.completedProjects,
    to: '/projects?status=COMPLETED',
  },
  { key: 'researchers', label: copy.researchers, to: '/users' },
  {
    key: 'pending_invitations',
    label: copy.pendingInvitations,
    to: '/invitations?status=PENDING',
  },
  { key: 'publications', label: copy.publications, to: '/publications' },
]

const TEASER_LIMIT = 3

export function useDashboard() {
  const { access } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [proposals, setProposals] = useState<AdminProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const cards = STAT_CARDS.map((c) => ({
    key: c.key,
    label: c.label,
    to: c.to,
    value: stats ? stats[c.key] : '—',
  }))

  return {
    copy,
    cards,
    proposals: proposals.slice(0, TEASER_LIMIT),
    pendingTotal: proposals.length,
    loading,
    error,
  }
}
