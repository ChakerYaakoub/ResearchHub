import { Link, NavLink, Outlet } from 'react-router-dom'
import { useDashboardLayout } from './useDashboardLayout'
import './DashboardLayout.css'

/** Logged-in app shell with responsive sidebar. */
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
      </ul>
    )
  }

  function renderSidebarBody() {
    return (
      <>
        <div className="rh-dash-brand mb-3">
          <Link to="/dashboard" onClick={vm.closeSidebar}>
            {vm.t('nav.brand')}
          </Link>
        </div>
        <nav aria-label={vm.t('nav.dashboard')}>{renderNav()}</nav>
        <div className="rh-dash-sidebar-foot mt-auto pt-3">
          <Link
            className="rh-dash-link d-block mb-3"
            to="/"
            onClick={vm.closeSidebar}
          >
            {vm.t('nav.publicSite')}
          </Link>
          {vm.user ? (
            <div className="small text-break text-muted mb-2" title={vm.user.email}>
              {vm.user.email}
            </div>
          ) : null}
          <div className="rh-lang mb-2" role="group" aria-label="Language">
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
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={() => void vm.onLogout()}
          >
            {vm.t('common.logOut')}
          </button>
        </div>
      </>
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
        {renderSidebarBody()}
      </aside>

      <div className="rh-dash-main d-flex flex-column min-vh-100">
        <header className="rh-dash-topbar d-lg-none">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
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
          <Link className="rh-dash-topbar-brand" to="/dashboard">
            {vm.t('nav.brand')}
          </Link>
        </header>
        <main className="rh-dash-content flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
