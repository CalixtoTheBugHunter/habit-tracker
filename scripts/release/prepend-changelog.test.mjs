import { describe, it, expect } from 'vitest'
import {
  firstChangelogReleaseVersion,
  prependReleaseSection,
  prependReleaseWithSections,
} from './prepend-changelog.mjs'
import { summarizeCommitSubjects } from './summarize-commits.mjs'

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

  it('prepends multiple sections in Keep a Changelog order', () => {
    const out = prependReleaseWithSections({
      fileContent: enHeader,
      version: '0.2.0',
      dateIso: '2026-04-21',
      locale: 'en',
      sections: {
        Fixed: ['fix: z'],
        Added: ['feat: a'],
        Changed: ['docs: b'],
      },
    })
    const idxAdded = out.indexOf('### Added')
    const idxChanged = out.indexOf('### Changed')
    const idxFixed = out.indexOf('### Fixed')
    expect(idxAdded).toBeLessThan(idxChanged)
    expect(idxChanged).toBeLessThan(idxFixed)
    expect(out).toContain('- feat: a')
    expect(out).toContain('- docs: b')
    expect(out).toContain('- fix: z')
  })

  it('omits empty sections', () => {
    const out = prependReleaseWithSections({
      fileContent: enHeader,
      version: '0.2.0',
      dateIso: '2026-04-21',
      locale: 'en',
      sections: { Added: ['feat: only'] },
    })
    expect(out).toContain('### Added')
    expect(out).not.toMatch(/\n### Changed\n/)
    expect(out).not.toMatch(/\n### Fixed\n/)
  })

  it('prepends pt-BR ### Nota before mirrored sections', () => {
    const pt = `# X\n\n## [0.1.0] - 2020-01-01\n\n### Adicionado\n\n- A\n`
    const out = prependReleaseWithSections({
      fileContent: pt,
      version: '0.2.0',
      dateIso: '2026-04-21',
      locale: 'pt-BR',
      sections: { Added: ['feat: x'], Fixed: ['fix: y'] },
      ptDisclaimerMarkdown: 'Disclaimer PT.',
    })
    const idxNota = out.indexOf('### Nota')
    const idxAdic = out.indexOf('### Adicionado')
    expect(idxNota).toBeLessThan(idxAdic)
    expect(out).toContain('Disclaimer PT.')
    expect(out).toContain('- feat: x')
    expect(out).toContain('### Corrigido')
  })

  it('integration: summarize then prepend en', () => {
    const subjects = ['feat: one', 'fix: two', 'chore(release): v0.1.0']
    const sec = summarizeCommitSubjects(subjects)
    const out = prependReleaseWithSections({
      fileContent: enHeader,
      version: '0.2.0',
      dateIso: '2026-06-01',
      locale: 'en',
      sections: sec,
    })
    expect(out).toContain('## [0.2.0] - 2026-06-01')
    expect(out).toContain('- feat: one')
    expect(out).toContain('- fix: two')
  })
})
