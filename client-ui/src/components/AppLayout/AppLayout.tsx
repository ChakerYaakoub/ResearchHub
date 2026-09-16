import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  type Location,
} from 'react-router-dom'
import { useAuth } from '../../auth'
import { setAppLanguage, type AppLanguage } from '../../i18n'
import { ScrollToTop } from '../ScrollToTop'
import './AppLayout.css'

const NAV_LINKS = [
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

/** Public shell: navbar, page outlet, footer. */
export function AppLayout() {
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

  function renderNavLinks() {
    return (
      <ul className="rh-nav-list">
        {NAV_LINKS.map((item) => (
          <li key={item.to}>
            <NavLink
              className={`rh-nav-link${activePath === item.to ? ' is-active' : ''}`}
              to={item.to}
              onClick={closeMenu}
            >
              {t(item.key)}
            </NavLink>
          </li>
        ))}
      </ul>
    )
  }

  function renderLang() {
    return (
      <div className="rh-lang" role="group" aria-label="Language">
        <button
          type="button"
          className={`rh-lang-btn${current === 'en' ? ' is-active' : ''}`}
          onClick={() => void onLang('en')}
        >
          {t('common.langEn')}
        </button>
        <button
          type="button"
          className={`rh-lang-btn${current === 'fr' ? ' is-active' : ''}`}
          onClick={() => void onLang('fr')}
        >
          {t('common.langFr')}
        </button>
      </div>
    )
  }

  function renderAuth() {
    if (isAuthenticated && user) {
      return (
        <div className="rh-nav-auth">
          <span className="rh-nav-user" title={user.email}>
            {user.email}
          </span>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onLogout}
          >
            {t('common.logOut')}
          </button>
        </div>
      )
    }
    return (
      <div className="rh-nav-auth">
        <Link
          className="btn btn-outline-secondary btn-sm"
          to="/login"
          state={{ background: authBackground }}
          onClick={closeMenu}
        >
          {t('common.logIn')}
        </Link>
        <Link
          className="btn btn-primary btn-sm"
          to="/register"
          state={{ background: authBackground }}
          onClick={closeMenu}
        >
          {t('common.register')}
        </Link>
      </div>
    )
  }

  return (
    <div className="rh-layout">
      <header className={`rh-header${menuOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="rh-mobile-backdrop"
          aria-label={t('common.close')}
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
        />

        <div className="container rh-header-inner">
          <Link className="rh-brand" to="/" onClick={closeMenu}>
            {t('nav.brand')}
          </Link>

          <nav className="rh-header-nav" aria-label="Main">
            {renderNavLinks()}
          </nav>

          <div className="rh-header-end">
            {renderLang()}
            {renderAuth()}
          </div>

          <button
            type="button"
            className="rh-toggler"
            aria-label={menuOpen ? t('common.close') : t('common.toggleNav')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="rh-mobile-panel">
          <nav aria-label="Mobile">{renderNavLinks()}</nav>
          <div className="rh-mobile-actions">
            {renderLang()}
            {renderAuth()}
          </div>
        </div>
      </header>

      <main className="rh-main">
        <Outlet />
      </main>

      <ScrollToTop />

      <footer className="rh-footer py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
          <span>{t('nav.footerTagline')}</span>
          <span className="text-muted">
            {t('nav.copyrightPrefix')} {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  )
}
