import { useTranslation } from 'react-i18next'
import './Instruments.css'

type InstrumentItem = { name: string; energy: string; use: string }

/** Informational list of fictional instruments. */
export function InstrumentsPage() {
  const { t } = useTranslation()
  const items = t('instruments.items', { returnObjects: true }) as InstrumentItem[]

  return (
    <>
      <header className="page-header py-4">
        <div className="container">
          <h1 className="page-title h2 mb-2">{t('instruments.title')}</h1>
          <p className="text-muted mb-0 col-lg-8 px-0">{t('instruments.intro')}</p>
        </div>
      </header>
      <div className="container py-4">
        <div className="d-flex flex-column gap-3">
          {Array.isArray(items) &&
            items.map((inst) => (
              <article className="instrument-row p-3" key={inst.name}>
                <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                  <div>
                    <h2 className="h5 mb-1">{inst.name}</h2>
                    <p className="mb-0 text-muted small">{inst.use}</p>
                  </div>
                  <span className="instrument-tag">{inst.energy}</span>
                </div>
              </article>
            ))}
        </div>
      </div>
    </>
  )
}
