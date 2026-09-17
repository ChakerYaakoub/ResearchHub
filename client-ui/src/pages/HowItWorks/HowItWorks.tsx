import { useTranslation } from 'react-i18next'
import { PageMeta, usePageMeta } from '../../components/PageMeta'
import './HowItWorks.css'

type TextBlock = { title: string; body: string }
type WorkflowStep = TextBlock & { status: string; items?: string[] }

/** Public `/how-it-works`: commercial overview from i18n only (no API). */
export function HowItWorksPage() {
  const { t } = useTranslation()
  const meta = usePageMeta({ pageKey: 'howItWorks' })
  const phases = t('howItWorks.phases', { returnObjects: true }) as TextBlock[]
  const steps = t('howItWorks.steps', { returnObjects: true }) as WorkflowStep[]
  const roles = t('howItWorks.roles', { returnObjects: true }) as TextBlock[]

  return (
    <>
      <PageMeta {...meta} />
      <header className="page-header py-4">
        <div className="container">
          <h1 className="page-title h2 mb-2">{t('howItWorks.title')}</h1>
          <p className="text-muted mb-0 col-lg-9 px-0">{t('howItWorks.intro')}</p>
        </div>
      </header>

      <div className="container py-4">
        <section className="mb-5">
          <h2 className="h4 mb-3">{t('howItWorks.phasesTitle')}</h2>
          <div className="row g-3">
            {Array.isArray(phases) &&
              phases.map((phase) => (
                <div className="col-12 col-md-6" key={phase.title}>
                  <article className="workflow-phase p-3 h-100">
                    <h3 className="h5">{phase.title}</h3>
                    <p className="mb-0 text-muted">{phase.body}</p>
                  </article>
                </div>
              ))}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="h4 mb-3">{t('howItWorks.lifecycleTitle')}</h2>
          <ol className="list-unstyled d-flex flex-column gap-3 mb-0">
            {Array.isArray(steps) &&
              steps.map((step, i) => (
                <li className="workflow-step p-3" key={`${step.status}-${i}`}>
                  <div className="workflow-status mb-1">
                    {i + 1}. {step.status}
                  </div>
                  <h3 className="h5">{step.title}</h3>
                  <p className="text-muted">{step.body}</p>
                  {Array.isArray(step.items) && step.items.length > 0 ? (
                    <ul className="workflow-items mb-0">
                      {step.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
          </ol>
        </section>

        <section>
          <h2 className="h4 mb-3">{t('howItWorks.rolesTitle')}</h2>
          <div className="row g-3">
            {Array.isArray(roles) &&
              roles.map((role) => (
                <div className="col-12 col-md-4" key={role.title}>
                  <article className="workflow-role p-3 h-100">
                    <h3 className="h6">{role.title}</h3>
                    <p className="small text-muted mb-0">{role.body}</p>
                  </article>
                </div>
              ))}
          </div>
        </section>
      </div>
    </>
  )
}
