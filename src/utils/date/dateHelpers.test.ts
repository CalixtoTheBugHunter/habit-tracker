import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDateString,
  getTodayLocalDateString,
  getYesterdayLocalDateString,
  getPreviousDayDateString,
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
      // Test with a UTC time that would be different dates in different timezones
      // 2025-01-15T23:00:00.000Z is:
      // - Jan 15 in timezones behind UTC (e.g., PST: 2025-01-15T15:00:00)
      // - Jan 16 in timezones ahead of UTC (e.g., JST: 2025-01-16T08:00:00)
      vi.setSystemTime(new Date('2025-01-15T23:00:00.000Z'))
      const result = getTodayLocalDateString()
      
      // The function should use local timezone methods (getFullYear/getMonth/getDate)
      // not UTC methods (getUTCFullYear/getUTCMonth/getUTCDate)
      // Verify by comparing with what the Date object reports in local time
      const systemDate = new Date('2025-01-15T23:00:00.000Z')
      const expectedYear = systemDate.getFullYear()
      const expectedMonth = String(systemDate.getMonth() + 1).padStart(2, '0')
      const expectedDay = String(systemDate.getDate()).padStart(2, '0')
      const expectedDate = `${expectedYear}-${expectedMonth}-${expectedDay}`
      
      // Verify the result matches local timezone interpretation
      expect(result).toBe(expectedDate)
      
      // Verify it's NOT using UTC methods
      // If it used UTC methods, it would always return '2025-01-15' for this UTC time
      const utcDate = '2025-01-15'
      // In timezones ahead of UTC, the result should be different from UTC date
      // In timezones behind UTC, it might be the same, but the important thing
      // is that it matches the local timezone interpretation
      if (systemDate.getDate() !== systemDate.getUTCDate()) {
        expect(result).not.toBe(utcDate)
      }
    })

    it('should handle timezone boundaries correctly (crossing midnight)', () => {
      // Test with times near midnight UTC that would be different dates in different timezones
      // 2025-01-15T23:30:00.000Z - near midnight UTC
      vi.setSystemTime(new Date('2025-01-15T23:30:00.000Z'))
      const result = getTodayLocalDateString()
      const systemDate = new Date('2025-01-15T23:30:00.000Z')
      const expectedDate = `${systemDate.getFullYear()}-${String(systemDate.getMonth() + 1).padStart(2, '0')}-${String(systemDate.getDate()).padStart(2, '0')}`
      expect(result).toBe(expectedDate)
    })

    it('should handle early morning UTC times correctly', () => {
      // 2025-01-15T01:00:00.000Z - early morning UTC
      // In timezones behind UTC, this is still Jan 14
      // In timezones ahead of UTC, this is Jan 15
      vi.setSystemTime(new Date('2025-01-15T01:00:00.000Z'))
      const result = getTodayLocalDateString()
      const systemDate = new Date('2025-01-15T01:00:00.000Z')
      const expectedDate = `${systemDate.getFullYear()}-${String(systemDate.getMonth() + 1).padStart(2, '0')}-${String(systemDate.getDate()).padStart(2, '0')}`
      expect(result).toBe(expectedDate)
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

    it('should handle timezone boundaries when calculating yesterday', () => {
      // Test with a time near midnight UTC
      // Yesterday should always be one day before today in local timezone
      vi.setSystemTime(new Date('2025-01-15T23:30:00.000Z'))
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

  describe('getPreviousDayDateString', () => {
    it('should return previous day from given date string', () => {
      expect(getPreviousDayDateString('2025-01-15')).toBe('2025-01-14')
      expect(getPreviousDayDateString('2025-01-01')).toBe('2024-12-31')
    })

    it('should handle month boundaries', () => {
      expect(getPreviousDayDateString('2025-03-01')).toBe('2025-02-28')
    })

    it('should throw error for invalid format', () => {
      expect(() => getPreviousDayDateString('invalid')).toThrow('Invalid date string format: invalid')
      expect(() => getPreviousDayDateString('2025-01')).toThrow('Invalid date string format: 2025-01')
    })

    it('should throw error for invalid date values', () => {
      expect(() => getPreviousDayDateString('2025-13-01')).toThrow('Invalid date string: 2025-13-01')
      expect(() => getPreviousDayDateString('2025-01-32')).toThrow('Invalid date string: 2025-01-32')
    })
  })
})

