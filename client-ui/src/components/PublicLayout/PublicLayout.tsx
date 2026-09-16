import { Link, NavLink, Outlet } from 'react-router-dom'
import { ScrollToTop } from '../ScrollToTop'
import { usePublicLayout } from './usePublicLayout'
import './PublicLayout.css'

/** Public marketing shell: navbar, page outlet, footer. */
export function PublicLayout() {
  const vm = usePublicLayout()

  function renderNavLinks() {
    return (
      <ul className="rh-nav-list">
        {vm.navLinks.map((item) => (
          <li key={item.to}>
            <NavLink
              className={`rh-nav-link${vm.activePath === item.to ? ' is-active' : ''}`}
              to={item.to}
              onClick={vm.closeMenu}
            >
              {vm.t(item.key)}
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
          className={`rh-lang-btn${vm.current === 'en' ? ' is-active' : ''}`}
          onClick={() => void vm.onLang('en')}
        >
          {vm.t('common.langEn')}
        </button>
        <button
          type="button"
          className={`rh-lang-btn${vm.current === 'fr' ? ' is-active' : ''}`}
          onClick={() => void vm.onLang('fr')}
        >
          {vm.t('common.langFr')}
        </button>
      </div>
    )
  }

  function renderAuth() {
    if (vm.isAuthenticated && vm.user) {
      return (
        <div className="rh-nav-auth">
          <Link
            className="btn btn-primary btn-sm"
            to="/dashboard"
            onClick={vm.closeMenu}
          >
            {vm.t('nav.goToDashboard')}
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => void vm.onLogout()}
          >
            {vm.t('common.logOut')}
          </button>
        </div>
      )
    }
    return (
      <div className="rh-nav-auth">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={vm.onOpenLogin}
        >
          {vm.t('common.logIn')}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={vm.onOpenRegister}
        >
          {vm.t('common.register')}
        </button>
      </div>
    )
  }

  return (
    <div className="rh-layout">
      <header className={`rh-header${vm.menuOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="rh-mobile-backdrop"
          aria-label={vm.t('common.close')}
          tabIndex={vm.menuOpen ? 0 : -1}
          onClick={vm.closeMenu}
        />

        <div className="container rh-header-inner">
          <Link className="rh-brand" to="/" onClick={vm.closeMenu}>
            {vm.t('nav.brand')}
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
            aria-label={
              vm.menuOpen ? vm.t('common.close') : vm.t('common.toggleNav')
            }
            aria-expanded={vm.menuOpen}
            onClick={vm.toggleMenu}
          >
            {vm.menuOpen ? (
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
          <span>{vm.t('nav.footerTagline')}</span>
          <span className="text-muted">
            {vm.t('nav.copyrightPrefix')} {vm.copyrightYear}
          </span>
        </div>
      </footer>
    </div>
  )
}
