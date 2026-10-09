import { useTranslation } from 'react-i18next'
import { en, type Content } from '../content/en'
import { fa } from '../content/fa'
import type { Lang } from '../i18n'

export function useContent() {
  const { i18n } = useTranslation()
  const lang: Lang = i18n.language === 'fa' ? 'fa' : 'en'
  const content: Content = lang === 'fa' ? fa : en
  return { content, lang, isRtl: lang === 'fa' }
}
