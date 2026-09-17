import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { setAppLanguage, type AppLanguage } from '../../i18n'

export const SIDEBAR_LINKS = [
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/projects', key: 'nav.projects' },
  { to: '/invitations', key: 'nav.invitations' },
  { to: '/account', key: 'nav.account' },
] as const

/**
 * Authenticated app chrome: sidebar links, page title from path, language, logout.
 * Mounted only under RequireAuth; does not re-check tokens beyond AuthContext.
 */
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

  const activePath = location.pathname
  const pageTitleKey = activePath.startsWith('/projects')
    ? 'nav.projects'
    : activePath.startsWith('/invitations')
      ? 'nav.invitations'
      : activePath.startsWith('/account')
        ? 'nav.account'
        : 'nav.dashboard'

  const seoKey = activePath.startsWith('/projects')
    ? 'projects'
    : activePath.startsWith('/invitations')
      ? 'invitations'
      : activePath.startsWith('/account')
        ? 'account'
        : 'dashboard'
  const documentTitle = t(`seo.${seoKey}.title`)

  return {
    t,
    user,
    sidebarOpen,
    closeSidebar,
    toggleSidebar,
    onLogout,
    onLang,
    current,
    activePath,
    links: SIDEBAR_LINKS,
    pageTitleKey,
    documentTitle,
  }
}
