import { isSupportedLocale } from '../config/supportedLanguages'
import type { LocaleCode } from '../locale/types'
import { getSetting, setSetting } from './indexedDB'

const PREFERRED_LANGUAGE_KEY = 'preferredLanguage'

export async function getPreferredLanguage(): Promise<LocaleCode | undefined> {
  const raw = await getSetting(PREFERRED_LANGUAGE_KEY)
  if (raw === undefined) return undefined
  return isSupportedLocale(raw) ? raw : undefined
}

export async function setPreferredLanguage(locale: LocaleCode): Promise<void> {
  if (!isSupportedLocale(locale)) return
  await setSetting(PREFERRED_LANGUAGE_KEY, locale)
}
