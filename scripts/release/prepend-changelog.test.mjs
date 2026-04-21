import { describe, it, expect } from 'vitest'
import {
  firstChangelogReleaseVersion,
  prependReleaseSection,
} from './prepend-changelog.mjs'

const enHeader = `# Changelog

All notable changes.

## [0.1.0] - 2020-01-01

### Added

- Old
`

describe('prepend-changelog', () => {
  it('firstChangelogReleaseVersion reads first release', () => {
    expect(firstChangelogReleaseVersion(enHeader)).toBe('0.1.0')
  })

  it('prepends en block with ### Added', () => {
    const out = prependReleaseSection({
      fileContent: enHeader,
      version: '0.2.0',
      dateIso: '2026-04-21',
      locale: 'en',
      bulletLines: ['First line', '- second'],
    })
    expect(out).toContain('## [0.2.0] - 2026-04-21')
    expect(out).toContain('### Added')
    expect(out).toContain('- First line')
    expect(out).toContain('- second')
    const idxNew = out.indexOf('## [0.2.0]')
    const idxOld = out.indexOf('## [0.1.0]')
    expect(idxNew).toBeLessThan(idxOld)
  })

  it('prepends pt-BR with ### Adicionado', () => {
    const pt = `# X\n\n## [0.1.0] - 2020-01-01\n\n### Adicionado\n\n- A\n`
    const out = prependReleaseSection({
      fileContent: pt,
      version: '0.2.0',
      dateIso: '2026-04-21',
      locale: 'pt-BR',
      bulletLines: ['Novo'],
    })
    expect(out).toContain('### Adicionado')
    expect(out).toContain('- Novo')
  })

  it('adds dash prefix when missing', () => {
    const out = prependReleaseSection({
      fileContent: enHeader,
      version: '0.2.0',
      dateIso: '2026-04-21',
      locale: 'en',
      bulletLines: ['no dash'],
    })
    expect(out).toContain('- no dash')
  })

  it('throws when no ## release heading', () => {
    expect(() =>
      prependReleaseSection({
        fileContent: '# Only\n\nNo release heading\n',
        version: '1.0.0',
        dateIso: '2026-01-01',
        locale: 'en',
        bulletLines: ['a'],
      })
    ).toThrow(/No top-level/)
  })
})
