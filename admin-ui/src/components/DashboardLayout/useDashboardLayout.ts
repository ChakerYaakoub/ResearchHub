import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

const BASE_LINKS = [
  { to: '/', label: copy.dashboard },
  { to: '/users', label: copy.users },
  { to: '/projects', label: copy.projects },
  { to: '/proposals', label: copy.proposals },
  { to: '/experiments', label: copy.experiments },
  { to: '/publications', label: copy.publications },
  { to: '/invitations', label: copy.invitations },
] as const

function titleForPath(pathname: string): string {
  if (pathname.startsWith('/admins')) return copy.admins
  if (pathname.startsWith('/users')) return copy.users
  if (pathname.startsWith('/projects')) return copy.projects
  if (pathname.startsWith('/proposals')) return copy.proposals
  if (pathname.startsWith('/experiments')) return copy.experiments
  if (pathname.startsWith('/publications')) return copy.publications
  if (pathname.startsWith('/invitations')) return copy.invitations
  return copy.dashboard
}

/** Sidebar shell state for the admin dashboard. */
export function useDashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isSuperAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  function closeSidebar() {
    setSidebarOpen(false)
  }

  function toggleSidebar() {
    setSidebarOpen((v) => !v)
  }

  async function onLogout() {
    closeSidebar()
    await logout()
    navigate('/login', { replace: true })
  }

  const links = useMemo(() => {
    if (!isSuperAdmin) return [...BASE_LINKS]
    return [
      BASE_LINKS[0],
      BASE_LINKS[1],
      { to: '/admins', label: copy.admins },
      ...BASE_LINKS.slice(2),
    ]
  }, [isSuperAdmin])

  return {
    copy,
    user,
    sidebarOpen,
    closeSidebar,
    toggleSidebar,
    onLogout,
    activePath: location.pathname,
    links,
    pageTitle: titleForPath(location.pathname),
  }
}
