import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../../api/client'
import { listExperiments } from '../../api/experiments'
import { listMyInvitations } from '../../api/invitations'
import { listProjects } from '../../api/projects'
import { listPublications } from '../../api/publications'
import { useAuth } from '../../auth'
import type { Invitation, Project } from '../../types/api'

export type DashboardCard = {
  key: string
  titleKey: string
  value: number
}

async function countAcrossProjects(
  token: string,
  projects: Project[],
  listFn: (token: string, projectId: number) => Promise<unknown[]>,
): Promise<number> {
  if (projects.length === 0) return 0
  const results = await Promise.all(
    projects.map(async (p) => {
      try {
        const rows = await listFn(token, p.id)
        return rows.length
      } catch {
        return 0
      }
    }),
  )
  return results.reduce((sum, n) => sum + n, 0)
}

/** Aggregate real project, invitation, experiment, and publication counts. */
export function useDashboard() {
  const { t } = useTranslation()
  const { access } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [experimentCount, setExperimentCount] = useState(0)
  const [publicationCount, setPublicationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!access) return
    let cancelled = false
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const [projs, invs] = await Promise.all([
          listProjects(access),
          listMyInvitations(access),
        ])
        if (cancelled) return

        const [experiments, publications] = await Promise.all([
          countAcrossProjects(access, projs, listExperiments),
          countAcrossProjects(access, projs, listPublications),
        ])
        if (cancelled) return

        setProjects(projs)
        setInvitations(invs)
        setExperimentCount(experiments)
        setPublicationCount(publications)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t('errors.loadFailed'),
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [access, t])

  const pendingInvites = invitations.filter((i) => i.status === 'PENDING')
    .length
  const underReview = projects.filter(
    (p) => p.status === 'UNDER_REVIEW' || p.status === 'RESUBMITTED',
  ).length
  const approved = projects.filter(
    (p) =>
      p.status === 'APPROVED' ||
      p.status === 'IN_PROGRESS' ||
      p.status === 'COMPLETED',
  ).length

  const cards: DashboardCard[] = [
    {
      key: 'myProjects',
      titleKey: 'dashboard.myProjects',
      value: projects.length,
    },
    {
      key: 'pendingInvitations',
      titleKey: 'dashboard.pendingInvitations',
      value: pendingInvites,
    },
    {
      key: 'underReview',
      titleKey: 'dashboard.underReview',
      value: underReview,
    },
    {
      key: 'approved',
      titleKey: 'dashboard.approved',
      value: approved,
    },
    {
      key: 'experiments',
      titleKey: 'dashboard.experiments',
      value: experimentCount,
    },
    {
      key: 'publications',
      titleKey: 'dashboard.publications',
      value: publicationCount,
    },
  ]

  return { t, cards, loading, error }
}
