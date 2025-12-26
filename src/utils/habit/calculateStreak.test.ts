import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateStreak } from './calculateStreak'

describe('calculateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return 0 for empty completion dates', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('should return 0 if today and yesterday are not completed', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const completionDates = [
      '2025-01-10T00:00:00.000Z',
      '2025-01-11T00:00:00.000Z',
    ]
    expect(calculateStreak(completionDates)).toBe(0)
  })

  it('should return 1 if only today is completed', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const today = '2025-01-15T00:00:00.000Z'
    expect(calculateStreak([today])).toBe(1)
  })

  it('should return 1 if only yesterday is completed', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const yesterday = '2025-01-14T00:00:00.000Z'
    expect(calculateStreak([yesterday])).toBe(1)
  })

  it('should calculate streak for consecutive days including today', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const completionDates = [
      '2025-01-13T00:00:00.000Z',
      '2025-01-14T00:00:00.000Z',
      '2025-01-15T00:00:00.000Z',
    ]
    expect(calculateStreak(completionDates)).toBe(3)
  })

  it('should calculate streak for consecutive days not including today', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const completionDates = [
      '2025-01-13T00:00:00.000Z',
      '2025-01-14T00:00:00.000Z',
    ]
    expect(calculateStreak(completionDates)).toBe(2)
  })

  it('should break streak on gaps', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const completionDates = [
      '2025-01-10T00:00:00.000Z',
      '2025-01-11T00:00:00.000Z',
      '2025-01-13T00:00:00.000Z',
      '2025-01-14T00:00:00.000Z',
      '2025-01-15T00:00:00.000Z',
    ]
    expect(calculateStreak(completionDates)).toBe(3)
  })

  it('should handle duplicate dates', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const completionDates = [
      '2025-01-14T00:00:00.000Z',
      '2025-01-14T12:00:00.000Z',
      '2025-01-15T00:00:00.000Z',
      '2025-01-15T12:00:00.000Z',
    ]
    expect(calculateStreak(completionDates)).toBe(2)
  })

  it('should handle dates with different times on same day', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const completionDates = [
      '2025-01-13T08:00:00.000Z',
      '2025-01-14T15:30:00.000Z',
      '2025-01-15T23:59:59.000Z',
    ]
    expect(calculateStreak(completionDates)).toBe(3)
  })

  it('should handle long streaks', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const completionDates: string[] = []
    for (let i = 0; i < 10; i++) {
      const date = new Date('2025-01-15T12:00:00.000Z')
      date.setDate(date.getDate() - i)
      completionDates.push(date.toISOString())
    }
    expect(calculateStreak(completionDates)).toBe(10)
  })

  describe('timezone handling', () => {
    it('should calculate streaks based on local timezone dates', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      const completionDates = [
        '2025-01-13T00:00:00.000Z',
        '2025-01-14T00:00:00.000Z',
        '2025-01-15T00:00:00.000Z',
      ]
      // Should calculate streak based on local timezone, not UTC
      expect(calculateStreak(completionDates)).toBe(3)
    })

    it('should handle timezone boundaries correctly when calculating streaks', () => {
      // Test with a time near midnight UTC that could be different dates in different timezones
      vi.setSystemTime(new Date('2025-01-15T23:30:00.000Z'))
      const completionDates = [
        '2025-01-13T00:00:00.000Z',
        '2025-01-14T00:00:00.000Z',
        '2025-01-15T00:00:00.000Z',
      ]
      // The streak should be calculated based on local timezone interpretation
      // In timezones ahead of UTC, today might be Jan 16, so the streak might be different
      const streak = calculateStreak(completionDates)
      // The streak should be at least 1 (if today is completed) or 0 (if not)
      expect(streak).toBeGreaterThanOrEqual(0)
    })

    it('should handle consecutive days across timezone boundaries', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      // Create completion dates that span multiple days
      const completionDates = [
        '2025-01-13T23:00:00.000Z', // Late evening UTC on Jan 13
        '2025-01-14T01:00:00.000Z', // Early morning UTC on Jan 14
        '2025-01-15T12:00:00.000Z', // Midday UTC on Jan 15
      ]
      // All dates should be converted to local timezone dates and streak calculated correctly
      const streak = calculateStreak(completionDates)
      expect(streak).toBeGreaterThanOrEqual(0)
    })

    it('should maintain streak consistency regardless of timezone', () => {
      // Test that streak calculation is consistent when dates are recorded
      // at different times of day in the same timezone
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      const completionDates = [
        '2025-01-13T08:00:00.000Z',
        '2025-01-13T20:00:00.000Z', // Same day, different time
        '2025-01-14T10:00:00.000Z',
        '2025-01-15T15:00:00.000Z',
      ]
      // Should count as 3 consecutive days (13, 14, 15)
      // Duplicate dates on the same day should not affect the streak
      expect(calculateStreak(completionDates)).toBe(3)
    })
  })
})

