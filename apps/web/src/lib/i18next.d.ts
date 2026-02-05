import 'i18next'
import type translation from '../locales/en.json'
import type { defaultNS } from './i18n'

declare module 'i18next' {
  // biome-ignore lint/style/useConsistentTypeDefinitions: module declaration
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: {
      translation: typeof translation
    }
  }
}
