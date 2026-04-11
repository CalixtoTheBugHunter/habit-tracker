import type { LocaleCode } from './types'
export { SUPPORTED_LOCALES } from '../config/supportedLanguages'

export function normalizeNavigatorLanguageTag(raw: string): LocaleCode {
  const subtag = raw.split('-')[0]?.toLowerCase() ?? 'en'
  if (subtag === 'pt') return 'pt-BR'
  if (subtag === 'en') return 'en'
  return 'en'
}

export function getDeviceLocale(): LocaleCode {
  const raw =
    typeof navigator !== 'undefined'
      ? navigator.languages?.[0] ?? navigator.language ?? 'en'
      : 'en'
  return normalizeNavigatorLanguageTag(String(raw))
}
