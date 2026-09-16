import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, type Location } from 'react-router-dom'
import { useAuth } from '../../auth'
import { setAppLanguage, type AppLanguage } from '../../i18n'

export const NAV_LINKS = [
  { to: '/facilities', key: 'nav.facilities' },
  { to: '/instruments', key: 'nav.instruments' },
  { to: '/how-it-works', key: 'nav.howItWorks' },
  { to: '/documentation', key: 'nav.documentation' },
] as const

type LocationState = { background?: Location }

function isAuthPath(pathname: string) {
  return pathname === '/login' || pathname === '/register'
}

function navPathname(location: Location): string {
  const background = (location.state as LocationState | null)?.background
  if (background) return background.pathname
  if (isAuthPath(location.pathname)) return '/'
  return location.pathname
}

/** Shell nav/auth/lang state for AppLayout. */
export function useAppLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const current = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as AppLanguage
  const activePath = navPathname(location)
  const authBackground =
    (location.state as LocationState | null)?.background ??
    (isAuthPath(location.pathname)
      ? ({ ...location, pathname: activePath } as Location)
      : location)

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

  return {
    t,
    menuOpen,
    closeMenu,
    toggleMenu,
    current,
    activePath,
    authBackground,
    isAuthenticated,
    user,
    onLogout,
    onLang,
    navLinks: NAV_LINKS,
    copyrightYear: new Date().getFullYear(),
  }
}
