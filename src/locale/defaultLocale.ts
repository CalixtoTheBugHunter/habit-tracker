import type { LocaleCode } from './types'

export const SUPPORTED_LOCALES: readonly LocaleCode[] = ['en']

let cachedLocale: LocaleCode | null = null

function getLanguageSubtag(localeTag: string): string {
  const part = localeTag.split('-')[0]
  return part ? part.toLowerCase() : 'en'
}

export function getDefaultLocale(): LocaleCode {
  if (cachedLocale !== null) {
    return cachedLocale
  }
  const raw =
    typeof navigator !== 'undefined'
      ? navigator.languages?.[0] ?? navigator.language ?? 'en'
      : 'en'
  const language = getLanguageSubtag(String(raw))
  cachedLocale = SUPPORTED_LOCALES.includes(language as LocaleCode)
    ? (language as LocaleCode)
    : 'en'
  return cachedLocale
}
