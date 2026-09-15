import { howItWorksIntro, workflowSteps } from './howItWorksContent'
import './HowItWorks.css'

/** Explains the ResearchHub project lifecycle. */
export function HowItWorksPage() {
  return (
    <>
      <header className="page-header py-4">
        <div className="container">
          <h1 className="page-title h2 mb-2">How it works</h1>
          <p className="text-muted mb-0 col-lg-8 px-0">{howItWorksIntro}</p>
        </div>
      </header>
      <div className="container py-4">
        <ol className="list-unstyled d-flex flex-column gap-3 mb-0">
          {workflowSteps.map((step, i) => (
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
