import { describe, it, expect } from 'vitest'
import { parseChangelogMarkdown } from './parseChangelogMarkdown'

describe('parseChangelogMarkdown', () => {
  it('returns empty array for empty string', () => {
    expect(parseChangelogMarkdown('')).toEqual([])
  })

  it('parses preamble before first ## as section with empty heading', () => {
    const md = `# Title\n\nIntro line.\n\n## [1.0.0]\n\nBody.`
    const sections = parseChangelogMarkdown(md)
    expect(sections[0]).toEqual({
      heading: '',
      body: '# Title\n\nIntro line.',
    })
    expect(sections[1]).toEqual({
      heading: '[1.0.0]',
      body: 'Body.',
    })
  })

  it('splits multiple ## sections', () => {
    const md = `## [1.0.0] - 2024-01-01
### Added
- a

## [0.9.0]
### Fixed
- b
`
    const sections = parseChangelogMarkdown(md)
    expect(sections).toHaveLength(2)
    const [a, b] = sections
    expect(a).toBeDefined()
    expect(b).toBeDefined()
    expect(a!.heading).toBe('[1.0.0] - 2024-01-01')
    expect(a!.body).toContain('### Added')
    expect(a!.body).toContain('- a')
    expect(b!.heading).toBe('[0.9.0]')
    expect(b!.body).toContain('- b')
  })

  it('does not treat ### as a new top-level section', () => {
    const md = `## [1.0.0]
### Added
- x
`
    const sections = parseChangelogMarkdown(md)
    expect(sections).toHaveLength(1)
    expect(sections[0]).toBeDefined()
    expect(sections[0]!.body).toContain('### Added')
  })

  it('handles Keep a Changelog style snippet', () => {
    const md = `## [0.1.0] - 2026-04-13

### Added

- Feature one

### Fixed

- Bug two
`
    const [section] = parseChangelogMarkdown(md)
    expect(section).toBeDefined()
    expect(section!.heading).toBe('[0.1.0] - 2026-04-13')
    expect(section!.body).toContain('### Added')
    expect(section!.body).toContain('- Feature one')
    expect(section!.body).toContain('### Fixed')
  })
})
