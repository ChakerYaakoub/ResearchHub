import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth'
import { setAppLanguage, type AppLanguage } from '../../i18n'
import './AppLayout.css'

const NAV_LINKS = [
  { to: '/facilities', key: 'nav.facilities' },
  { to: '/instruments', key: 'nav.instruments' },
  { to: '/how-it-works', key: 'nav.howItWorks' },
  { to: '/documentation', key: 'nav.documentation' },
] as const

/** Public shell: responsive navbar, page outlet, footer, language switcher. */
export function AppLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const current = (i18n.language?.startsWith('fr') ? 'fr' : 'en') as AppLanguage

  const close = () => setOpen(false)

  async function onLogout() {
    close()
    await logout()
  }

  async function onLang(lng: AppLanguage) {
    await setAppLanguage(lng)
  }

  return (
    <div className="rh-layout">
      <nav className="navbar navbar-expand-lg rh-navbar sticky-top">
        <div className="container">
          <Link className="navbar-brand rh-brand" to="/" onClick={close}>
            {t('nav.brand')}
          </Link>
          <button
            type="button"
            className="rh-toggler d-lg-none"
            aria-label={t('common.toggleNav')}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="rh-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse${open ? ' show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-1">
              {NAV_LINKS.map((item) => (
                <li className="nav-item" key={item.to}>
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link rh-nav-link${isActive ? ' active' : ''}`
                    }
                    to={item.to}
                    onClick={close}
                  >
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center">
              <div className="btn-group btn-group-sm" role="group" aria-label="Language">
                <button
                  type="button"
                  className={`btn btn-sm ${current === 'en' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => void onLang('en')}
                >
                  {t('common.langEn')}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${current === 'fr' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => void onLang('fr')}
                >
                  {t('common.langFr')}
                </button>
              </div>
              {isAuthenticated && user ? (
                <>
                  <span className="small text-muted text-truncate" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={onLogout}
                  >
                    {t('common.logOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="btn btn-outline-secondary btn-sm"
                    to="/login"
                    state={{ background: location }}
                    onClick={close}
                  >
                    {t('common.logIn')}
                  </Link>
                  <Link
                    className="btn btn-primary btn-sm"
                    to="/register"
                    state={{ background: location }}
                    onClick={close}
                  >
                    {t('common.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="rh-main">
        <Outlet />
      </main>

      <footer className="rh-footer py-4 mt-auto">
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
