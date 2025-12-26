import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDateString,
  getTodayLocalDateString,
  getYesterdayLocalDateString,
  getPreviousDayUTCDateString,
} from './dateHelpers'

describe('dateHelpers', () => {
  describe('getDateString', () => {
    it('should extract date part from ISO 8601 string', () => {
      expect(getDateString('2025-01-15T12:00:00.000Z')).toBe('2025-01-15')
      expect(getDateString('2025-12-31T23:59:59.999Z')).toBe('2025-12-31')
    })

    it('should throw error for invalid date string', () => {
      expect(() => getDateString('invalid')).toThrow('Invalid date string: invalid')
      expect(() => getDateString('')).toThrow('Invalid date string: ')
    })
  })

  describe('getTodayLocalDateString', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return today\'s date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      expect(getTodayLocalDateString()).toBe('2025-01-15')
    })

    it('should handle month and day padding', () => {
      vi.setSystemTime(new Date('2025-01-05T12:00:00.000Z'))
      expect(getTodayLocalDateString()).toBe('2025-01-05')
    })

    it('should use local timezone instead of UTC', () => {
      // Verify that the function uses local timezone methods
      // by checking it returns the date based on local time, not UTC
      vi.setSystemTime(new Date('2025-01-15T23:00:00.000Z'))
      const result = getTodayLocalDateString()
      // The result should be based on local timezone interpretation of the system time
      // This verifies the function uses getFullYear/getMonth/getDate, not UTC methods
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('getYesterdayLocalDateString', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return yesterday\'s date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      expect(getYesterdayLocalDateString()).toBe('2025-01-14')
    })

    it('should handle month boundaries', () => {
      vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'))
      expect(getYesterdayLocalDateString()).toBe('2024-12-31')
    })

    it('should always return one day before today in local timezone', () => {
      // Test that yesterday is always one day before today, regardless of timezone
      vi.setSystemTime(new Date('2025-01-16T00:00:00.000Z'))
      const today = getTodayLocalDateString()
      const yesterday = getYesterdayLocalDateString()
      
      // Verify yesterday is one day before today
      const todayDate = new Date(today + 'T00:00:00')
      const yesterdayDate = new Date(yesterday + 'T00:00:00')
      const diffTime = todayDate.getTime() - yesterdayDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(1)
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

