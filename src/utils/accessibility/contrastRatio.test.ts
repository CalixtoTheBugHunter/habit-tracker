import { describe, it, expect } from 'vitest'
import { hexToRgb, getLuminance, getContrastRatio, meetsWCAGAA } from './contrastRatio'

describe('contrastRatio', () => {
  describe('hexToRgb', () => {
    it('should convert 6-digit hex with # to RGB', () => {
      const result = hexToRgb('#ffffff')
      expect(result).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('should convert 6-digit hex without # to RGB', () => {
      const result = hexToRgb('000000')
      expect(result).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('should convert 3-digit hex with # to RGB', () => {
      const result = hexToRgb('#fff')
      expect(result).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('should convert 3-digit hex without # to RGB', () => {
      const result = hexToRgb('f00')
      expect(result).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return null for invalid hex string', () => {
      expect(hexToRgb('invalid')).toBeNull()
      expect(hexToRgb('#gggggg')).toBeNull()
      expect(hexToRgb('12')).toBeNull()
      expect(hexToRgb('12345')).toBeNull()
    })

    it('should handle mixed case hex', () => {
      const result = hexToRgb('#FF00aa')
      expect(result).toEqual({ r: 255, g: 0, b: 170 })
    })
  })

  describe('getLuminance', () => {
    it('should return 0 for black', () => {
      const result = getLuminance(0, 0, 0)
      expect(result).toBe(0)
    })

    it('should return 1 for white', () => {
      const result = getLuminance(255, 255, 255)
      expect(result).toBe(1)
    })

    it('should return correct luminance for mid-gray', () => {
      const result = getLuminance(128, 128, 128)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(1)
    })

    it('should return higher luminance for lighter colors', () => {
      const dark = getLuminance(50, 50, 50)
      const light = getLuminance(200, 200, 200)
      expect(light).toBeGreaterThan(dark)
    })
  })

  describe('getContrastRatio', () => {
    it('should return 21:1 for black and white', () => {
      const result = getContrastRatio('#000000', '#ffffff')
      expect(result).toBeCloseTo(21, 1)
    })

    it('should return 1:1 for same colors', () => {
      const result = getContrastRatio('#000000', '#000000')
      expect(result).toBe(1)
    })

    it('should return same ratio regardless of order', () => {
      const result1 = getContrastRatio('#000000', '#ffffff')
      const result2 = getContrastRatio('#ffffff', '#000000')
      expect(result1).toBe(result2)
    })

    it('should return correct ratio for known WCAG examples', () => {
      const result = getContrastRatio('#000000', '#1976d2')
      expect(result).toBeGreaterThan(4.5)
    })

    it('should handle invalid colors gracefully', () => {
      const result = getContrastRatio('invalid', '#ffffff')
      expect(result).toBe(1)
    })
  })

  describe('meetsWCAGAA', () => {
    it('should return true for ratio >= 4.5 for normal text', () => {
      expect(meetsWCAGAA(4.5)).toBe(true)
      expect(meetsWCAGAA(5.0)).toBe(true)
      expect(meetsWCAGAA(21.0)).toBe(true)
    })

    it('should return false for ratio < 4.5 for normal text', () => {
      expect(meetsWCAGAA(4.4)).toBe(false)
      expect(meetsWCAGAA(3.0)).toBe(false)
      expect(meetsWCAGAA(1.0)).toBe(false)
    })

    it('should return true for ratio >= 3 for large text', () => {
      expect(meetsWCAGAA(3.0, true)).toBe(true)
      expect(meetsWCAGAA(4.0, true)).toBe(true)
      expect(meetsWCAGAA(21.0, true)).toBe(true)
    })

    it('should return false for ratio < 3 for large text', () => {
      expect(meetsWCAGAA(2.9, true)).toBe(false)
      expect(meetsWCAGAA(1.0, true)).toBe(false)
    })
  })
})


