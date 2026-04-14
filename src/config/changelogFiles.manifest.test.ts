import { describe, it, expect } from 'vitest'
import { changelogFileByLocale } from './changelogFiles'
import { SUPPORTED_LOCALES } from './supportedLanguages'

describe('changelog-files manifest', () => {
  it('keys match SUPPORTED_LOCALES', () => {
    expect(Object.keys(changelogFileByLocale).sort()).toEqual(
      [...SUPPORTED_LOCALES].sort()
    )
  })

  it('each path is non-empty', () => {
    for (const p of Object.values(changelogFileByLocale)) {
      expect(p.trim().length).toBeGreaterThan(0)
    }
  })
})
