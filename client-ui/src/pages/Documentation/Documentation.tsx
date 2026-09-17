import { useTranslation } from 'react-i18next'
import { PageMeta, usePageMeta } from '../../components/PageMeta'
import './Documentation.css'

type DocSection = { title: string; body: string; items?: string[] }

/** Public `/documentation`: learn-more sections from i18n only (no API). */
export function DocumentationPage() {
  const { t } = useTranslation()
  const meta = usePageMeta({ pageKey: 'documentation' })
  const sections = t('documentation.sections', {
    returnObjects: true,
  }) as DocSection[]

  return (
    <>
      <PageMeta {...meta} />
      <header className="page-header py-4">
        <div className="container">
          <h1 className="page-title h2 mb-2">{t('documentation.title')}</h1>
          <p className="text-muted mb-0 col-lg-9 px-0">
            {t('documentation.intro')}
          </p>
        </div>
      </header>
      <div className="container py-4">
        <div className="row g-3">
          {Array.isArray(sections) &&
            sections.map((section) => (
              <div className="col-12 col-lg-6" key={section.title}>
                <article className="doc-block p-3 h-100">
                  <h2 className="h5">{section.title}</h2>
                  <p className="text-muted">{section.body}</p>
                  {Array.isArray(section.items) && section.items.length > 0 ? (
                    <ul className="doc-items mb-0">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}
