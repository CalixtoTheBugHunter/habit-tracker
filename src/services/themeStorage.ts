import { getSetting, setSetting } from './indexedDB'

export type ThemePreference = 'light' | 'dark' | 'system'

const PREFERRED_THEME_KEY = 'preferredTheme'

const THEME_VALUES: readonly ThemePreference[] = ['light', 'dark', 'system']

function isThemePreference(value: string): value is ThemePreference {
  return (THEME_VALUES as readonly string[]).includes(value)
}

export async function getPreferredTheme(): Promise<ThemePreference | undefined> {
  const raw = await getSetting(PREFERRED_THEME_KEY)
  if (raw === undefined) return undefined
  return isThemePreference(raw) ? raw : undefined
}

export async function setPreferredTheme(theme: ThemePreference): Promise<void> {
  // Mirror to localStorage so the inline script in index.html can apply the
  // theme synchronously on next load and avoid a flash of the wrong theme.
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PREFERRED_THEME_KEY, theme)
    }
  } catch {
    // Safari private mode / disabled storage: ignore, IndexedDB is source of truth.
  }
  await setSetting(PREFERRED_THEME_KEY, theme)
}
