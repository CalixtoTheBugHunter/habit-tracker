import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getUTCDateString,
  getTodayUTCDateString,
  getYesterdayUTCDateString,
  getPreviousDayUTCDateString,
} from './dateHelpers'

describe('dateHelpers', () => {
  describe('getUTCDateString', () => {
    it('should extract date part from ISO 8601 string', () => {
      expect(getUTCDateString('2025-01-15T12:00:00.000Z')).toBe('2025-01-15')
      expect(getUTCDateString('2025-12-31T23:59:59.999Z')).toBe('2025-12-31')
    })

    it('should throw error for invalid date string', () => {
      expect(() => getUTCDateString('invalid')).toThrow('Invalid date string: invalid')
      expect(() => getUTCDateString('')).toThrow('Invalid date string: ')
    })
  })

  describe('getTodayUTCDateString', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return today\'s date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      expect(getTodayUTCDateString()).toBe('2025-01-15')
    })

    it('should handle month and day padding', () => {
      vi.setSystemTime(new Date('2025-01-05T12:00:00.000Z'))
      expect(getTodayUTCDateString()).toBe('2025-01-05')
    })
  })

  describe('getYesterdayUTCDateString', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return yesterday\'s date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      expect(getYesterdayUTCDateString()).toBe('2025-01-14')
    })

    it('should handle month boundaries', () => {
      vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'))
      expect(getYesterdayUTCDateString()).toBe('2024-12-31')
    })
  })

  describe('getPreviousDayUTCDateString', () => {
    it('should return previous day from given date string', () => {
      expect(getPreviousDayUTCDateString('2025-01-15')).toBe('2025-01-14')
      expect(getPreviousDayUTCDateString('2025-01-01')).toBe('2024-12-31')
    })

    it('should handle month boundaries', () => {
      expect(getPreviousDayUTCDateString('2025-03-01')).toBe('2025-02-28')
    })

    it('should throw error for invalid format', () => {
      expect(() => getPreviousDayUTCDateString('invalid')).toThrow('Invalid date string format: invalid')
      expect(() => getPreviousDayUTCDateString('2025-01')).toThrow('Invalid date string format: 2025-01')
    })

    it('should throw error for invalid date values', () => {
      expect(() => getPreviousDayUTCDateString('2025-13-01')).toThrow('Invalid date string: 2025-13-01')
      expect(() => getPreviousDayUTCDateString('2025-01-32')).toThrow('Invalid date string: 2025-01-32')
    })
  })
})

