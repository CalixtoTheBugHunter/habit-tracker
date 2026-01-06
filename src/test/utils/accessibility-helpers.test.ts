import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getComputedColor, getButtonContrastRatio, verifyButtonContrast } from './accessibility-helpers'

describe('accessibility-helpers', () => {
  let mockElement: HTMLElement
  let mockGetComputedStyle: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockElement = document.createElement('button')
    mockElement.textContent = 'Test Button'
    
    mockGetComputedStyle = vi.fn(() => ({
      getPropertyValue: vi.fn((prop: string) => {
        if (prop === 'color') return 'rgb(0, 0, 0)'
        if (prop === 'background-color') return 'rgb(255, 255, 255)'
        return ''
      }),
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(255, 255, 255)',
    }))
    
    window.getComputedStyle = mockGetComputedStyle
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getComputedColor', () => {
    it('should get computed color for valid element', () => {
      const result = getComputedColor(mockElement, 'color')
      expect(result).toBe('#000000')
      expect(mockGetComputedStyle).toHaveBeenCalledWith(mockElement)
    })

    it('should get computed background-color for valid element', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn(() => 'rgb(255, 0, 0)'),
        backgroundColor: 'rgb(255, 0, 0)',
      })
      
      const result = getComputedColor(mockElement, 'background-color')
      expect(result).toBe('#ff0000')
    })

    it('should handle hex color values', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn(() => '#ff0000'),
        color: '#ff0000',
      })
      
      const result = getComputedColor(mockElement, 'color')
      expect(result).toBe('#ff0000')
    })

    it('should handle rgba color values', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn(() => 'rgba(0, 0, 0, 0.5)'),
        color: 'rgba(0, 0, 0, 0.5)',
      })
      
      const result = getComputedColor(mockElement, 'color')
      expect(result).toBe('#000000')
    })

    it('should return default color for invalid values', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn(() => 'invalid'),
        color: 'invalid',
      })
      
      const result = getComputedColor(mockElement, 'color')
      expect(result).toBe('#000000')
    })
  })

  describe('getButtonContrastRatio', () => {
    it('should calculate contrast ratio for button with black text on white background', () => {
      const result = getButtonContrastRatio(mockElement)
      expect(result).toBeCloseTo(21, 1)
    })

    it('should calculate contrast ratio for button with different colors', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn((prop: string) => {
          if (prop === 'color') return 'rgb(0, 0, 0)'
          if (prop === 'background-color') return 'rgb(25, 118, 210)'
          return ''
        }),
        color: 'rgb(0, 0, 0)',
        backgroundColor: 'rgb(25, 118, 210)',
      })
      
      const result = getButtonContrastRatio(mockElement)
      expect(result).toBeGreaterThan(4.5)
    })
  })

  describe('verifyButtonContrast', () => {
    it('should return true for button meeting minimum contrast', () => {
      const result = verifyButtonContrast(mockElement, 4.5)
      expect(result).toBe(true)
    })

    it('should return false for button not meeting minimum contrast', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn((prop: string) => {
          if (prop === 'color') return 'rgb(200, 200, 200)'
          if (prop === 'background-color') return 'rgb(210, 210, 210)'
          return ''
        }),
        color: 'rgb(200, 200, 200)',
        backgroundColor: 'rgb(210, 210, 210)',
      })
      
      const result = verifyButtonContrast(mockElement, 4.5)
      expect(result).toBe(false)
    })

    it('should use custom minimum ratio', () => {
      const result = verifyButtonContrast(mockElement, 3.0)
      expect(result).toBe(true)
    })
  })
})


