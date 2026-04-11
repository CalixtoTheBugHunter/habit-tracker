import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SUPPORTED_LOCALES } from './defaultLocale'

describe('normalizeNavigatorLanguageTag', () => {
  let normalizeNavigatorLanguageTag: (raw: string) => 'en' | 'pt-BR'

  beforeEach(async () => {
    vi.resetModules()
    ;({ normalizeNavigatorLanguageTag } = await import('./defaultLocale'))
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('should return en for en language', () => {
    expect(normalizeNavigatorLanguageTag('en')).toBe('en')
  })

  it('should return en for en-US', () => {
    expect(normalizeNavigatorLanguageTag('en-US')).toBe('en')
  })

  it('should return en for unsupported language', () => {
    expect(normalizeNavigatorLanguageTag('fr')).toBe('en')
  })

  it('should return pt-BR for pt-BR language', () => {
    expect(normalizeNavigatorLanguageTag('pt-BR')).toBe('pt-BR')
  })

  it('should return pt-BR for pt language', () => {
    expect(normalizeNavigatorLanguageTag('pt')).toBe('pt-BR')
  })
})

describe('getDeviceLocale', () => {
  let originalNavigator: typeof navigator

  beforeEach(() => {
    originalNavigator = globalThis.navigator
    vi.resetModules()
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
    vi.resetModules()
  })

  it('should return en for en language', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'en', languages: ['en'] },
      writable: true,
      configurable: true,
    })
    const { getDeviceLocale } = await import('./defaultLocale')
    expect(getDeviceLocale()).toBe('en')
  })

  it('should return en for en-US', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'en-US', languages: ['en-US', 'en'] },
      writable: true,
      configurable: true,
    })
    const { getDeviceLocale } = await import('./defaultLocale')
    expect(getDeviceLocale()).toBe('en')
  })

  it('should return en for unsupported language', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'fr', languages: ['fr', 'en'] },
      writable: true,
      configurable: true,
    })
    const { getDeviceLocale } = await import('./defaultLocale')
    expect(getDeviceLocale()).toBe('en')
  })

  it('should return en when navigator.languages is empty and language is unsupported', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'xx', languages: [] },
      writable: true,
      configurable: true,
    })
    const { getDeviceLocale } = await import('./defaultLocale')
    expect(getDeviceLocale()).toBe('en')
  })

  it('should return pt-BR for pt-BR language', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'pt-BR', languages: ['pt-BR', 'en'] },
      writable: true,
      configurable: true,
    })
    const { getDeviceLocale } = await import('./defaultLocale')
    expect(getDeviceLocale()).toBe('pt-BR')
  })

  it('should return pt-BR for pt language', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'pt', languages: ['pt', 'en'] },
      writable: true,
      configurable: true,
    })
    const { getDeviceLocale } = await import('./defaultLocale')
    expect(getDeviceLocale()).toBe('pt-BR')
  })
})

describe('SUPPORTED_LOCALES', () => {
  it('should include en', () => {
    expect(SUPPORTED_LOCALES).toContain('en')
  })

  it('should include pt-BR', () => {
    expect(SUPPORTED_LOCALES).toContain('pt-BR')
  })
})
