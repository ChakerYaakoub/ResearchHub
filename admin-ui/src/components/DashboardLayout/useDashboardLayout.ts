import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { copy } from '../../copy'

export const SIDEBAR_LINKS = [{ to: '/', label: copy.dashboard }] as const

/** Sidebar shell state for the admin dashboard. */
export function useDashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
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

  return {
    copy,
    user,
    sidebarOpen,
    closeSidebar,
    toggleSidebar,
    onLogout,
    activePath: location.pathname,
    links: SIDEBAR_LINKS,
    pageTitle: copy.dashboard,
  }
}
