import { createI18n } from 'vue-i18n'
import en from './locales/en'
import vi from './locales/vi'

const LOCALE_KEY = 'locale'

const saved = localStorage.getItem(LOCALE_KEY)
const locale = saved === 'en' || saved === 'vi' ? saved : 'vi'

const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'vi',
  messages: { en, vi },
})

export function setLocale(lang: 'en' | 'vi') {
  ;(i18n.global.locale as { value: string }).value = lang
  localStorage.setItem(LOCALE_KEY, lang)
}

export function getLocale(): string {
  return (i18n.global.locale as { value: string }).value
}

export default i18n
