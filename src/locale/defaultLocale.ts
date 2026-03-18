import type { LocaleCode } from './types'

export const SUPPORTED_LOCALES: readonly LocaleCode[] = ['en', 'pt-BR']

let cachedLocale: LocaleCode | null = null

function normalizeToSupportedLocale(localeTag: string): LocaleCode {
  const subtag = localeTag.split('-')[0]?.toLowerCase() ?? 'en'
  if (subtag === 'pt') return 'pt-BR'
  if (subtag === 'en') return 'en'
  return 'en'
}

export function getDefaultLocale(): LocaleCode {
  if (cachedLocale !== null) {
    return cachedLocale
  }
  const raw =
    typeof navigator !== 'undefined'
      ? navigator.languages?.[0] ?? navigator.language ?? 'en'
      : 'en'
  cachedLocale = normalizeToSupportedLocale(String(raw))
  return cachedLocale
}
