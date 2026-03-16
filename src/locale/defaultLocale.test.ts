import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SUPPORTED_LOCALES } from './defaultLocale'

describe('getDefaultLocale', () => {
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
    const { getDefaultLocale: getLocale } = await import('./defaultLocale')
    expect(getLocale()).toBe('en')
  })

  it('should return en for en-US', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'en-US', languages: ['en-US', 'en'] },
      writable: true,
      configurable: true,
    })
    const { getDefaultLocale: getLocale } = await import('./defaultLocale')
    expect(getLocale()).toBe('en')
  })

  it('should return en for unsupported language', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'fr', languages: ['fr', 'en'] },
      writable: true,
      configurable: true,
    })
    const { getDefaultLocale: getLocale } = await import('./defaultLocale')
    expect(getLocale()).toBe('en')
  })

  it('should return en when navigator.languages is empty and language is unsupported', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'xx', languages: [] },
      writable: true,
      configurable: true,
    })
    const { getDefaultLocale: getLocale } = await import('./defaultLocale')
    expect(getLocale()).toBe('en')
  })
})

describe('SUPPORTED_LOCALES', () => {
  it('should include en', () => {
    expect(SUPPORTED_LOCALES).toContain('en')
  })
})
