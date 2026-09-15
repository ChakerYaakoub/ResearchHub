import { useTranslation } from 'react-i18next'
import './Facilities.css'

type FacilityItem = { name: string; focus: string }

/** Informational list of fictional research facilities. */
export function FacilitiesPage() {
  const { t } = useTranslation()
  const items = t('facilities.items', { returnObjects: true }) as FacilityItem[]

  return (
    <>
      <header className="page-header py-4">
        <div className="container">
          <h1 className="page-title h2 mb-2">{t('facilities.title')}</h1>
          <p className="text-muted mb-0 col-lg-8 px-0">{t('facilities.intro')}</p>
        </div>
      </header>
      <div className="container py-4">
        <ul className="list-unstyled row g-3 mb-0">
          {Array.isArray(items) &&
            items.map((f) => (
              <li className="col-12 col-md-6 col-lg-4" key={f.name}>
                <div className="facility-item p-3 h-100">
                  <h2 className="h5">{f.name}</h2>
                  <p className="mb-0 text-muted small">{f.focus}</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </>
  )
}
