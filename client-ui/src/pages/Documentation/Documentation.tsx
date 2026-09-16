import { useTranslation } from 'react-i18next'
import './Documentation.css'

type DocSection = { title: string; body: string }

/** Public documentation overview. */
export function DocumentationPage() {
  const { t } = useTranslation()
  const sections = t('documentation.sections', {
    returnObjects: true,
  }) as DocSection[]

  return (
    <>
      <header className="page-header py-4">
        <div className="container">
          <h1 className="page-title h2 mb-2">{t('documentation.title')}</h1>
          <p className="text-muted mb-0 col-lg-8 px-0">
            {t('documentation.intro')}
          </p>
        </div>
      </header>
      <div className="container py-4">
        <div className="row g-3">
          {Array.isArray(sections) &&
            sections.map((section) => (
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
