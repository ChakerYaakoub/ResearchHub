/** i18n settings for client-ui (en + fr only). */

export const I18N_STORAGE_KEY = 'rh_lang'

export const supportedLngs = ['en', 'fr'] as const

export type AppLanguage = (typeof supportedLngs)[number]

export const fallbackLng: AppLanguage = 'en'

/** Resolve initial language: stored → browser fr* → en. */
export function detectInitialLanguage(): AppLanguage {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(I18N_STORAGE_KEY)
    if (stored === 'en' || stored === 'fr') return stored
    const browser = navigator.language?.toLowerCase() ?? ''
    if (browser.startsWith('fr')) return 'fr'
  }
  return fallbackLng
}
