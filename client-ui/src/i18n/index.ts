import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  detectInitialLanguage,
  fallbackLng,
  I18N_STORAGE_KEY,
  supportedLngs,
  type AppLanguage,
} from './config'
import en from './locales/en.json'
import fr from './locales/fr.json'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: detectInitialLanguage(),
  fallbackLng,
  supportedLngs: [...supportedLngs],
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  if (lng === 'en' || lng === 'fr') {
    localStorage.setItem(I18N_STORAGE_KEY, lng)
  }
})

export async function setAppLanguage(lng: AppLanguage): Promise<void> {
  await i18n.changeLanguage(lng)
  localStorage.setItem(I18N_STORAGE_KEY, lng)
}

export type { AppLanguage }
export { supportedLngs, fallbackLng, I18N_STORAGE_KEY, detectInitialLanguage }

export default i18n
