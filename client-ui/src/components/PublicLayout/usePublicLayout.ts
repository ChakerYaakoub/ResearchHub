import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../auth'
import { setAppLanguage, type AppLanguage } from '../../i18n'
import { useAuthUi } from '../AuthUi'

export const NAV_LINKS = [
  { to: '/how-it-works', key: 'nav.howItWorks' },
  { to: '/documentation', key: 'nav.documentation' },
] as const

/** Public marketing shell — auth via modal buttons only. */
export function usePublicLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { openLogin, openRegister } = useAuthUi()
  const current = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as AppLanguage
  const activePath = location.pathname

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  async function onLogout() {
    closeMenu()
    await logout()
  }

  async function onLang(lng: AppLanguage) {
    await setAppLanguage(lng)
  }

  function toggleMenu() {
    setMenuOpen((v) => !v)
  }

  function onOpenLogin() {
    closeMenu()
    openLogin()
  }

  function onOpenRegister() {
    closeMenu()
    openRegister()
  }

  return {
    t,
    menuOpen,
    closeMenu,
    toggleMenu,
    current,
    activePath,
    isAuthenticated,
    user,
    onLogout,
    onLang,
    onOpenLogin,
    onOpenRegister,
    navLinks: NAV_LINKS,
    copyrightYear: new Date().getFullYear(),
  }
}
