import { describe, it, expect } from 'vitest'
import { parseAiSummary } from './parse-ai-summary.mjs'

describe('parseAiSummary', () => {
  it('parses plain JSON', () => {
    const raw = '{"en":"English summary.","pt-BR":"Resumo em PT."}'
    const out = parseAiSummary(raw, ['en', 'pt-BR'])
    expect(out.en).toBe('English summary.')
    expect(out['pt-BR']).toBe('Resumo em PT.')
  })

  it('parses JSON wrapped in ```json fences', () => {
    const raw = '```json\n{"en":"E","pt-BR":"P"}\n```'
    const out = parseAiSummary(raw, ['en', 'pt-BR'])
    expect(out.en).toBe('E')
    expect(out['pt-BR']).toBe('P')
  })

  it('parses JSON wrapped in bare ``` fences', () => {
    const raw = '```\n{"en":"E","pt-BR":"P"}\n```'
    const out = parseAiSummary(raw, ['en', 'pt-BR'])
    expect(out.en).toBe('E')
  })

  it('throws when a locale key is missing', () => {
    expect(() =>
      parseAiSummary('{"en":"only english"}', ['en', 'pt-BR'])
    ).toThrow(/missing locale: pt-BR/)
  })

  it('throws when a locale value is empty or whitespace', () => {
    expect(() =>
      parseAiSummary('{"en":"   ","pt-BR":"ok"}', ['en', 'pt-BR'])
    ).toThrow(/empty for locale: en/)
  })

  it('throws when a value contains a markdown heading', () => {
    const raw = '{"en":"### Summary\\nText","pt-BR":"ok"}'
    expect(() => parseAiSummary(raw, ['en', 'pt-BR'])).toThrow(/markdown/)
  })

  it('trims leading and trailing whitespace on values', () => {
    const raw = '{"en":"  hello  ","pt-BR":"\\nPT paragraph\\n"}'
    const out = parseAiSummary(raw, ['en', 'pt-BR'])
    expect(out.en).toBe('hello')
    expect(out['pt-BR']).toBe('PT paragraph')
  })

  it('ignores extra unknown locale keys', () => {
    const raw = '{"en":"E","pt-BR":"P","es":"Spanish extra"}'
    const out = parseAiSummary(raw, ['en', 'pt-BR'])
    expect(out).toEqual({ en: 'E', 'pt-BR': 'P' })
  })

  it('throws on empty response', () => {
    expect(() => parseAiSummary('   ', ['en'])).toThrow(/empty/)
  })

  it('throws on non-JSON', () => {
    expect(() => parseAiSummary('not json at all', ['en'])).toThrow(/not valid JSON/)
  })

  it('throws when response is a JSON array', () => {
    expect(() => parseAiSummary('["a","b"]', ['en'])).toThrow(/must be a JSON object/)
  })
})
