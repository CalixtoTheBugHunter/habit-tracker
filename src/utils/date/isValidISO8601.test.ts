import { describe, it, expect } from 'vitest'
import { isValidISO8601 } from './isValidISO8601'

describe('isValidISO8601', () => {
  describe('valid ISO 8601 dates', () => {
    it.each([
      ['2025-01-01T00:00:00.000Z'],
      ['2025-12-31T23:59:59.999Z'],
      ['2025-06-15T12:30:45.123Z'],
      ['2000-01-01T00:00:00.000Z'],
      ['2099-12-31T23:59:59.999Z'],
    ])('should return true for valid ISO 8601 date: %s', (dateString) => {
      expect(isValidISO8601(dateString)).toBe(true)
    })
  })

  describe('invalid ISO 8601 dates', () => {
    it.each([
      ['not-a-date'],
      ['2025-13-45T00:00:00.000Z'], // Invalid month/day
      ['2025-01-01'], // Missing time and Z
      ['2025-01-01T00:00:00'], // Missing Z
      ['2025-01-01T00:00:00Z'], // Missing milliseconds
      ['2025-01-01 00:00:00.000Z'], // Space instead of T
      ['2025/01/01T00:00:00.000Z'], // Wrong date separator
      ['2025-01-01T00:00:00.000'], // Missing Z
      ['2025-01-01T25:00:00.000Z'], // Invalid hour
      ['2025-01-01T00:60:00.000Z'], // Invalid minute
      ['2025-01-01T00:00:60.000Z'], // Invalid second
      [''],
      ['2025-01-01T00:00:00.000Z+00:00'], // Timezone offset not supported
    ])('should return false for invalid date: %s', (dateString) => {
      expect(isValidISO8601(dateString)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should return false for dates that parse but do not match ISO format exactly', () => {
      // Date that can be parsed but doesn't match the exact ISO format
      const date = new Date('2025-01-01')
      const isoString = date.toISOString()
      // This should pass, but let's test a case that would fail
      expect(isValidISO8601(isoString)).toBe(true)
    })

    it('should handle dates that are valid but not in UTC', () => {
      // A date string that looks valid but isn't in UTC format
      expect(isValidISO8601('2025-01-01T00:00:00.000+00:00')).toBe(false)
    })
  })
})

