import { describe, it, expect } from 'vitest'
import { buildAiSummaryPrompt } from './build-ai-summary-prompt.mjs'

describe('buildAiSummaryPrompt', () => {
  it('includes version in the prompt', () => {
    const p = buildAiSummaryPrompt({
      version: '1.2.3',
      locales: ['en'],
      sections: { Added: ['feat: a'] },
    })
    expect(p).toContain('1.2.3')
  })

  it('requires every locale key in the JSON schema', () => {
    const p = buildAiSummaryPrompt({
      version: '0.5.0',
      locales: ['en', 'pt-BR', 'es'],
      sections: { Added: ['feat: x'] },
    })
    expect(p).toContain('"en"')
    expect(p).toContain('"pt-BR"')
    expect(p).toContain('"es"')
  })

  it('includes bullets from Added, Changed, and Fixed verbatim', () => {
    const p = buildAiSummaryPrompt({
      version: '0.5.0',
      locales: ['en'],
      sections: {
        Added: ['feat: alpha'],
        Changed: ['docs: beta'],
        Fixed: ['fix: gamma'],
      },
    })
    expect(p).toContain('feat: alpha')
    expect(p).toContain('docs: beta')
    expect(p).toContain('fix: gamma')
  })

  it('includes compareUrl when provided', () => {
    const p = buildAiSummaryPrompt({
      version: '0.5.0',
      locales: ['en'],
      sections: { Added: ['feat: x'] },
      compareUrl: 'https://github.com/o/r/compare/v0.4.0...HEAD',
    })
    expect(p).toContain('https://github.com/o/r/compare/v0.4.0...HEAD')
  })

  it('omits compare line when compareUrl is empty', () => {
    const p = buildAiSummaryPrompt({
      version: '0.5.0',
      locales: ['en'],
      sections: { Added: ['feat: x'] },
      compareUrl: '',
    })
    expect(p).not.toContain('Compare view')
  })

  it('uses initial-release guidance when all sections are empty', () => {
    const p = buildAiSummaryPrompt({
      version: '0.1.0',
      locales: ['en'],
      sections: { Added: [], Changed: [], Fixed: [] },
    })
    expect(p.toLowerCase()).toContain('initial release')
  })

  it('returns a string', () => {
    const p = buildAiSummaryPrompt({
      version: '0.5.0',
      locales: ['en'],
      sections: { Added: ['feat: x'] },
    })
    expect(typeof p).toBe('string')
  })
})
