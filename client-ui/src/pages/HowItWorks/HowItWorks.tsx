import { useTranslation } from 'react-i18next'
import './HowItWorks.css'

type WorkflowStep = { status: string; title: string; body: string }

/** Explains the ResearchHub project lifecycle. */
export function HowItWorksPage() {
  const { t } = useTranslation()
  const steps = t('howItWorks.steps', { returnObjects: true }) as WorkflowStep[]

  return (
    <>
      <header className="page-header py-4">
        <div className="container">
          <h1 className="page-title h2 mb-2">{t('howItWorks.title')}</h1>
          <p className="text-muted mb-0 col-lg-8 px-0">{t('howItWorks.intro')}</p>
        </div>
      </header>
      <div className="container py-4">
        <ol className="list-unstyled d-flex flex-column gap-3 mb-0">
          {Array.isArray(steps) &&
            steps.map((step, i) => (
              <li className="workflow-step p-3" key={step.status}>
                <div className="workflow-status mb-1">
                  {i + 1}. {step.status}
                </div>
                <h2 className="h5">{step.title}</h2>
                <p className="mb-0 text-muted">{step.body}</p>
              </li>
            ))}
        </ol>
      </div>
    </>
  )
}
