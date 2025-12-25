// biome-ignore lint/style/noExportedImports: required configuration before export
import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

export const defaultNS = 'common'

// ... (imports)

// Typed Hook
// With strict typing configured in module declaration, we can just export the original hook
export { useTranslation } from 'react-i18next'

// Initialize
// Initialize
let initPromise: Promise<typeof i18n> | null = null

export const initLocalization = (locale?: string) => {
  if (initPromise) return initPromise

  // Default to 'en' if no locale provided. Consumer should provide it.
  const defaultLocale = locale || 'en'

  initPromise = i18n
    .use(initReactI18next)
    .use(
      resourcesToBackend((language: string) => {
        if (language.startsWith('zh')) {
          return import('./locales/zh-CN.json')
        }
        return import('./locales/en.json')
      })
    )
    .init({
      lng: defaultLocale,
      fallbackLng: 'en',
      defaultNS,
      supportedLngs: ['en', 'zh-CN'],
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      }
    })
    .then(() => i18n)

  return initPromise
}

export default i18n
