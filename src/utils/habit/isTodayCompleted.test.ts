import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isTodayCompleted } from './isTodayCompleted'

describe('isTodayCompleted', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return false for empty completion dates', () => {
    expect(isTodayCompleted([])).toBe(false)
  })

  it('should return true if today is in completion dates', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const today = '2025-01-15T00:00:00.000Z'
    expect(isTodayCompleted([today])).toBe(true)
  })

  it('should return true if today is in completion dates with different time', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const today = '2025-01-15T23:59:59.000Z'
    expect(isTodayCompleted([today])).toBe(true)
  })

  it('should return false if today is not in completion dates', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const yesterday = '2025-01-14T00:00:00.000Z'
    expect(isTodayCompleted([yesterday])).toBe(false)
  })

  it('should return false if only future dates are in completion dates', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const future = '2025-01-16T00:00:00.000Z'
    expect(isTodayCompleted([future])).toBe(false)
  })

  it('should return true if today is in multiple completion dates', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const today1 = '2025-01-15T08:00:00.000Z'
    const today2 = '2025-01-15T20:00:00.000Z'
    expect(isTodayCompleted([today1, today2])).toBe(true)
  })

  describe('timezone handling', () => {
    it('should correctly compare dates using local timezone', () => {
      vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
      const today = '2025-01-15T00:00:00.000Z'
      const yesterday = '2025-01-14T00:00:00.000Z'
      const tomorrow = '2025-01-16T00:00:00.000Z'

      expect(isTodayCompleted([today])).toBe(true)
      expect(isTodayCompleted([yesterday])).toBe(false)
      expect(isTodayCompleted([tomorrow])).toBe(false)
    })
  })
})

