import { documentationIntro, documentationSections } from './documentationContent'
import './Documentation.css'

/** Public documentation overview. */
export function DocumentationPage() {
  return (
    <>
      <header className="page-header py-4">
        <div className="container">
          <h1 className="page-title h2 mb-2">Documentation</h1>
          <p className="text-muted mb-0 col-lg-8 px-0">{documentationIntro}</p>
        </div>
      </header>
      <div className="container py-4">
        <div className="row g-3">
          {documentationSections.map((section) => (
            <div className="col-12 col-md-6" key={section.title}>
              <article className="doc-block p-3 h-100">
                <h2 className="h5">{section.title}</h2>
                <p className="mb-0 text-muted">{section.body}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
