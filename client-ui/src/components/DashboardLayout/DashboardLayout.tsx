import { Link, NavLink, Outlet } from 'react-router-dom'
import { useDashboardLayout } from './useDashboardLayout'
import './DashboardLayout.css'

/** Logged-in app shell with sidebar + top header. */
export function DashboardLayout() {
  const vm = useDashboardLayout()

  function renderNav() {
    return (
      <ul className="rh-dash-nav list-unstyled mb-0">
        {vm.links.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={() => {
                const active =
                  item.to === '/dashboard'
                    ? vm.activePath === '/dashboard'
                    : vm.activePath === item.to ||
                      vm.activePath.startsWith(`${item.to}/`)
                return `rh-dash-link${active ? ' is-active' : ''}`
              }}
              onClick={vm.closeSidebar}
            >
              {vm.t(item.key)}
            </NavLink>
          </li>
        ))}
        <li>
          <Link
            className="rh-dash-link"
            to="/"
            onClick={vm.closeSidebar}
          >
            {vm.t('nav.publicSite')}
          </Link>
        </li>
      </ul>
    )
  }

  return (
    <div className={`rh-dash${vm.sidebarOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="rh-dash-backdrop"
        aria-label={vm.t('common.close')}
        tabIndex={vm.sidebarOpen ? 0 : -1}
        onClick={vm.closeSidebar}
      />

      <aside className="rh-dash-sidebar d-flex flex-column">
        <div className="rh-dash-brand mb-3">
          <Link to="/dashboard" onClick={vm.closeSidebar}>
            {vm.t('nav.brand')}
          </Link>
        </div>
        <nav aria-label={vm.t('nav.dashboard')}>{renderNav()}</nav>
      </aside>

      <div className="rh-dash-main d-flex flex-column min-vh-100">
        <header className="rh-dash-header">
          <div className="rh-dash-header-start">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rh-dash-menu-btn"
              aria-label={vm.t('common.toggleNav')}
              aria-expanded={vm.sidebarOpen}
              onClick={vm.toggleSidebar}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"
                />
              </svg>
            </button>
            <h1 className="rh-dash-header-title h5 mb-0">
              {vm.t(vm.pageTitleKey)}
            </h1>
          </div>

          <div className="rh-dash-header-end">
            {vm.user ? (
              <span className="rh-dash-header-user" title={vm.user.email}>
                {vm.user.email}
              </span>
            ) : null}
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
            <Link className="btn btn-outline-secondary btn-sm d-none d-sm-inline-flex" to="/">
              {vm.t('nav.publicSite')}
            </Link>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => void vm.onLogout()}
            >
              {vm.t('common.logOut')}
            </button>
          </div>
        </header>

        <main className="rh-dash-content flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
