import type { LocaleCode } from '../locale/types'

export const supportedLanguages = [
  { code: 'en' as const, name: 'English', nativeName: 'English' },
  { code: 'pt-BR' as const, name: 'Portuguese', nativeName: 'Português' },
] as const satisfies ReadonlyArray<{
  code: LocaleCode
  name: string
  nativeName: string
}>

export type SupportedLanguageEntry = (typeof supportedLanguages)[number]

export const SUPPORTED_LOCALES: readonly LocaleCode[] = supportedLanguages.map(
  (l) => l.code
)

export const defaultLanguage: LocaleCode = 'en'

export function isSupportedLocale(code: string): code is LocaleCode {
  return (SUPPORTED_LOCALES as readonly string[]).includes(code)
}
