import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createDateString, createDateStrings } from './date-helpers'

describe('date-helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('createDateString', () => {
    it('should create date string for today', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      const result = createDateString(0)
      expect(result).toBe('2025-01-15T00:00:00.000Z')
    })

    it('should create date string for yesterday', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      const result = createDateString(1)
      expect(result).toBe('2025-01-14T00:00:00.000Z')
    })

    it('should create date string for multiple days ago', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      const result = createDateString(3)
      expect(result).toBe('2025-01-12T00:00:00.000Z')
    })

    it('should use provided base date', () => {
      const baseDate = new Date('2025-06-20T12:00:00.000Z')
      const result = createDateString(2, baseDate)
      expect(result).toBe('2025-06-18T00:00:00.000Z')
    })
  })

  describe('createDateStrings', () => {
    it('should create multiple date strings', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      const result = createDateStrings([0, 1, 2])
      expect(result).toEqual([
        '2025-01-15T00:00:00.000Z',
        '2025-01-14T00:00:00.000Z',
        '2025-01-13T00:00:00.000Z',
      ])
    })

    it('should handle empty array', () => {
      const result = createDateStrings([])
      expect(result).toEqual([])
    })

    it('should use provided base date', () => {
      const baseDate = new Date('2025-06-20T12:00:00.000Z')
      const result = createDateStrings([0, 1], baseDate)
      expect(result).toEqual([
        '2025-06-20T00:00:00.000Z',
        '2025-06-19T00:00:00.000Z',
      ])
    })
  })
})

