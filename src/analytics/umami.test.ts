import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isEnabled, loadScript, track } from './umami'

describe('umami analytics', () => {
  let originalOnLine: boolean
  let originalUmami: typeof window.umami

  beforeEach(() => {
    originalOnLine = navigator.onLine
    originalUmami = window.umami
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine,
    })
    window.umami = originalUmami
    const scripts = document.head.querySelectorAll(
      'script[data-website-id], script[src*="umami"]'
    )
    scripts.forEach((s) => s.remove())
  })

  describe('isEnabled', () => {
    it('returns true when VITE_ANALYTICS_ENABLED is "true" and VITE_UMAMI_WEBSITE_ID is set', () => {
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'my-website-id')
      expect(isEnabled()).toBe(true)
    })

    it('returns false when VITE_ANALYTICS_ENABLED is not set', () => {
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'id')
      expect(isEnabled()).toBe(false)
    })

    it('returns false when VITE_ANALYTICS_ENABLED is not "true"', () => {
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'false')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'id')
      expect(isEnabled()).toBe(false)
    })

    it('returns false when VITE_UMAMI_WEBSITE_ID is missing', () => {
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      expect(isEnabled()).toBe(false)
    })

    it('returns false when VITE_UMAMI_WEBSITE_ID is empty string', () => {
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '')
      expect(isEnabled()).toBe(false)
    })
  })

  describe('loadScript', () => {
    it('does not add script when disabled', () => {
      const before = document.head.querySelectorAll('script').length
      loadScript()
      const after = document.head.querySelectorAll('script').length
      expect(after).toBe(before)
    })

    it('adds script with correct src and data-website-id when enabled', () => {
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'test-id')
      loadScript()
      const script = document.head.querySelector(
        'script[data-website-id="test-id"]'
      ) as HTMLScriptElement | null
      expect(script).not.toBeNull()
      expect(script?.src).toContain('cloud.umami.is/script.js')
      expect(script?.getAttribute('data-website-id')).toBe('test-id')
    })

    it('uses VITE_UMAMI_SRC when set', () => {
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'id')
      vi.stubEnv('VITE_UMAMI_SRC', 'https://custom.umami.is/script.js')
      loadScript()
      const script = document.head.querySelector(
        'script[data-website-id="id"]'
      ) as HTMLScriptElement | null
      expect(script).not.toBeNull()
      expect(script?.src).toContain('custom.umami.is/script.js')
    })

    it('calls window.umami.track() in script onload for pageview', () => {
      const mockTrack = vi.fn()
      window.umami = { track: mockTrack }
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'id')
      loadScript()
      const script = document.head.querySelector(
        'script[data-website-id="id"]'
      ) as HTMLScriptElement
      expect(script?.onload).toBeDefined()
      ;(script.onload as () => void)()
      expect(mockTrack).toHaveBeenCalledTimes(1)
    })
  })

  describe('track', () => {
    it('does not call window.umami.track when disabled', () => {
      const mockTrack = vi.fn()
      window.umami = { track: mockTrack }
      track('habit_created')
      expect(mockTrack).not.toHaveBeenCalled()
    })

    it('does not call window.umami.track when offline', () => {
      const mockTrack = vi.fn()
      window.umami = { track: mockTrack }
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'id')
      track('habit_created')
      expect(mockTrack).not.toHaveBeenCalled()
    })

    it('does not throw when window.umami is undefined', () => {
      window.umami = undefined
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'id')
      expect(() => track('habit_created')).not.toThrow()
    })

    it('calls window.umami.track with event name when enabled and online', () => {
      const mockTrack = vi.fn()
      window.umami = { track: mockTrack }
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })
      vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true')
      vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'id')
      track('habit_created')
      expect(mockTrack).toHaveBeenCalledWith('habit_created', undefined)
    })
  })
})
