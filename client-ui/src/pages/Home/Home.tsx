import { Link } from 'react-router-dom'
import { useHome } from './useHome'
import './Home.css'

/** Marketing home — brand-first hero and workflow overview. */
export function HomePage() {
  const vm = useHome()

  return (
    <>
      <section className="home-hero py-5">
        <div className="container py-lg-4">
          <p className="home-hero-brand display-4 fw-bold mb-3">
            {vm.t('home.hero.brand')}
          </p>
          <h1 className="h2 fw-semibold mb-3 col-lg-8 px-0">
            {vm.t('home.hero.headline')}
          </h1>
          <p className="lead text-muted col-lg-7 px-0 mb-4">
            {vm.t('home.hero.support')}
          </p>
          <div className="d-flex flex-wrap gap-2">
            {vm.isAuthenticated ? (
              <Link className="btn btn-primary" to="/dashboard">
                {vm.t('nav.goToDashboard')}
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={vm.openRegister}
              >
                {vm.t('home.hero.ctaRegister')}
              </button>
            )}
            <Link className="btn btn-outline-secondary" to="/how-it-works">
              {vm.t('home.hero.ctaHowItWorks')}
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="home-section-title h4 mb-4">
          {vm.t('home.stepsHeading')}
        </h2>
        <div className="row g-3">
          {vm.steps.map((step, i) => (
            <div className="col-12 col-sm-6 col-lg-3" key={step.title}>
              <div className="home-step p-3">
                <div className="home-step-num mb-2">
                  {vm.t('home.stepLabel', { n: i + 1 })}
                </div>
                <h3 className="h5">{step.title}</h3>
                <p className="mb-0 text-muted small">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
