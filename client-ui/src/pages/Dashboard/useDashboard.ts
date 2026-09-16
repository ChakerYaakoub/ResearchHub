import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../api/client'
import { listMyInvitations } from '../../api/invitations'
import { listProjects } from '../../api/projects'
import { useAuth } from '../../auth'
import type { Invitation, Project } from '../../types/api'

export type DashboardCard = {
  key: string
  titleKey: string
  value: string | number
  to?: string
  muted?: boolean
  hintKey?: string
}

/** Aggregate project + invitation counts for dashboard cards. */
export function useDashboard() {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!access) return
    let cancelled = false
    setLoading(true)
    setError(null)
    void Promise.all([listProjects(access), listMyInvitations(access)])
      .then(([projs, invs]) => {
        if (!cancelled) {
          setProjects(projs)
          setInvitations(invs)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t('errors.loadFailed'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [access, t])

  const pendingInvites = invitations.filter((i) => i.status === 'PENDING').length
  const underReview = projects.filter((p) => p.status === 'UNDER_REVIEW').length
  const approved = projects.filter((p) => p.status === 'APPROVED').length

  const cards: DashboardCard[] = [
    {
      key: 'myProjects',
      titleKey: 'dashboard.myProjects',
      value: projects.length,
      to: '/projects',
    },
    {
      key: 'pendingInvitations',
      titleKey: 'dashboard.pendingInvitations',
      value: pendingInvites,
      to: '/invitations',
    },
    {
      key: 'underReview',
      titleKey: 'dashboard.underReview',
      value: underReview,
      to: '/projects',
    },
    {
      key: 'approved',
      titleKey: 'dashboard.approved',
      value: approved,
      to: '/projects',
    },
    {
      key: 'experiments',
      titleKey: 'dashboard.experiments',
      value: '—',
      muted: true,
      hintKey: 'dashboard.phase11Hint',
      to: '/projects',
    },
    {
      key: 'publications',
      titleKey: 'dashboard.publications',
      value: '—',
      muted: true,
      hintKey: 'dashboard.phase11Hint',
      to: '/projects',
    },
  ]

  return { t, cards, loading, error }
}
