import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { setAppLanguage, type AppLanguage } from '../../i18n'

export const SIDEBAR_LINKS = [
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/projects', key: 'nav.projects' },
  { to: '/invitations', key: 'nav.invitations' },
] as const

/** Sidebar shell state for the researcher dashboard. */
export function useDashboardLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const current = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as AppLanguage

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
    navigate('/', { replace: true })
  }

  async function onLang(lng: AppLanguage) {
    await setAppLanguage(lng)
  }

  return {
    t,
    user,
    sidebarOpen,
    closeSidebar,
    toggleSidebar,
    onLogout,
    onLang,
    current,
    activePath: location.pathname,
    links: SIDEBAR_LINKS,
  }
}
