import { describe, it, expect } from 'vitest'
import { assertReleaseChangelogManifest } from './assert-changelog-manifest.mjs'

describe('assertReleaseChangelogManifest', () => {
  it('accepts en + pt-BR only', () => {
    expect(() =>
      assertReleaseChangelogManifest({
        en: 'CHANGELOG.md',
        'pt-BR': 'CHANGELOG.pt-BR.md',
      })
    ).not.toThrow()
  })

  it('rejects extra locales', () => {
    expect(() =>
      assertReleaseChangelogManifest({
        en: 'CHANGELOG.md',
        'pt-BR': 'CHANGELOG.pt-BR.md',
        fr: 'CHANGELOG.fr.md',
      })
    ).toThrow(/unsupported locale/)
  })

  it('rejects missing pt-BR', () => {
    expect(() =>
      assertReleaseChangelogManifest({
        en: 'CHANGELOG.md',
      })
    ).toThrow(/pt-BR/)
  })

  it('rejects non-object', () => {
    expect(() => assertReleaseChangelogManifest(null)).toThrow(/JSON object/)
  })
})
