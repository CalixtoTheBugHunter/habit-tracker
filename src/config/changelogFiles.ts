import type { LocaleCode } from '../locale/types'
import manifest from '../../changelog-files.json'

/**
 * Maps locale to changelog filename (repo root). Kept in sync with
 * {@link ../../changelog-files.json}; validated by changelogFiles.manifest.test.ts.
 */
export const changelogFileByLocale = manifest as Record<LocaleCode, string>

export function changelogBasenameForLocale(locale: LocaleCode): string {
  const path = changelogFileByLocale[locale]
  if (!path) {
    return changelogFileByLocale.en
  }
  const parts = path.split('/')
  return parts[parts.length - 1] ?? 'CHANGELOG.md'
}
