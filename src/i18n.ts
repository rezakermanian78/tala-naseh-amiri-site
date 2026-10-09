import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './content/en'
import { fa } from './content/fa'

export type Lang = 'en' | 'fa'

const stored = (() => {
  try {
    return localStorage.getItem('lang')
  } catch {
    return null
  }
})()

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fa: { translation: fa } },
  lng: stored === 'fa' ? 'fa' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnObjects: true,
})

export default i18n
