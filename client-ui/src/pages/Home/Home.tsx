import { Link } from 'react-router-dom'
import { home } from './strings'
import './Home.css'

/** Marketing home — brand-first hero and workflow overview. */
export function HomePage() {
  return (
    <>
      <section className="home-hero py-5">
        <div className="container py-lg-4">
          <p className="home-hero-brand display-4 fw-bold mb-3">{home.hero.brand}</p>
          <h1 className="h2 fw-semibold mb-3 col-lg-8 px-0">{home.hero.headline}</h1>
          <p className="lead text-muted col-lg-7 px-0 mb-4">{home.hero.support}</p>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/register">
              {home.hero.ctaRegister}
            </Link>
            <Link className="btn btn-outline-secondary" to="/how-it-works">
              {home.hero.ctaHowItWorks}
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="home-section-title h4 mb-4">{home.stepsHeading}</h2>
        <div className="row g-3">
          {home.steps.map((step, i) => (
            <div className="col-12 col-sm-6 col-lg-3" key={step.title}>
              <div className="home-step p-3">
                <div className="home-step-num mb-2">{home.stepLabel(i + 1)}</div>
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
