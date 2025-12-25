import * as Localization from 'expo-localization'
// biome-ignore lint/style/noExportedImports: erquired configuration before export
import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import {
  initReactI18next,
  useTranslation as useTranslationOriginal
} from 'react-i18next'
import en from './locales/en.json'

// Define the type for the resources
export const defaultNS = 'common'
export const resources = {
  en: { common: en.common }
} as const
export type I18nResources = (typeof resources)['en']
export type I18nKey = keyof I18nResources['common']

// Typed Hook
// Note: We are not using module augmentation here to avoid complex setup for the consumer.
// Instead we cast the resources for this specific hook.
// The generic constraint for useTranslation is <Ns, KPrefix>.
// We simple pass 'common' as default NS.
export const useTranslation = () => useTranslationOriginal<any>()

// Initialize
const initPromise = i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      // Basic dynamic import logic
      if (language === 'en' && namespace === 'common') {
        return import('./locales/en.json')
      }
      return import('./locales/en.json')
    })
  )
  .init({
    lng: Localization.getLocales()[0]?.languageCode ?? 'en',
    fallbackLng: 'en',
    defaultNS,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })

export const initLocalization = () => initPromise

export default i18n
