import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getYearGrid,
  getWeekStartDate,
  getDateString,
  isDateCompleted,
} from './annualCalendarHelpers'

describe('annualCalendarHelpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-11-19T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getDateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(Date.UTC(2025, 0, 15))
      expect(getDateString(date)).toBe('2025-01-15')
    })

    it('should handle month and day padding', () => {
      const date = new Date(Date.UTC(2025, 0, 5))
      expect(getDateString(date)).toBe('2025-01-05')
    })
  })

  describe('getWeekStartDate', () => {
    it('should return the Sunday of the week for a given date', () => {
      // Wednesday, Jan 15, 2025
      const date = new Date(Date.UTC(2025, 0, 15))
      const weekStart = getWeekStartDate(date)
      // Should be Sunday, Jan 12, 2025
      expect(weekStart.getUTCDate()).toBe(12)
      expect(weekStart.getUTCDay()).toBe(0) // Sunday
    })

    it('should return the same date if it is already Sunday', () => {
      const date = new Date(Date.UTC(2025, 0, 12)) // Sunday
      const weekStart = getWeekStartDate(date)
      expect(weekStart.getUTCDate()).toBe(12)
      expect(weekStart.getUTCDay()).toBe(0)
    })
  })

  describe('getYearGrid', () => {
    it('should return 53 weeks for a year', () => {
      const grid = getYearGrid(2025)
      expect(grid.length).toBe(53)
    })

    it('should return 7 days per week', () => {
      const grid = getYearGrid(2025)
      grid.forEach(week => {
        expect(week.length).toBe(7)
      })
    })

    it('should start with the first Sunday of the year', () => {
      const grid = getYearGrid(2025)
      const firstWeek = grid[0]
      const firstDay = firstWeek[0]
      // Jan 1, 2025 is a Wednesday, so first Sunday should be Dec 29, 2024
      expect(firstDay.getUTCFullYear()).toBe(2024)
      expect(firstDay.getUTCMonth()).toBe(11) // December (0-indexed)
      expect(firstDay.getUTCDate()).toBe(29)
      expect(firstDay.getUTCDay()).toBe(0) // Sunday
    })

    it('should have consecutive dates', () => {
      const grid = getYearGrid(2025)
      const allDays = grid.flat()
      for (let i = 1; i < allDays.length; i++) {
        const prev = allDays[i - 1]
        const curr = allDays[i]
        const expectedNext = new Date(prev)
        expectedNext.setUTCDate(expectedNext.getUTCDate() + 1)
        expect(curr.getTime()).toBe(expectedNext.getTime())
      }
    })
  })

  describe('isDateCompleted', () => {
    it('should return true if date is in completion dates', () => {
      const completionDates = [
        '2025-01-15T00:00:00.000Z',
        '2025-02-20T00:00:00.000Z',
      ]
      expect(isDateCompleted('2025-01-15', completionDates)).toBe(true)
      expect(isDateCompleted('2025-02-20', completionDates)).toBe(true)
    })

    it('should return false if date is not in completion dates', () => {
      const completionDates = [
        '2025-01-15T00:00:00.000Z',
        '2025-02-20T00:00:00.000Z',
      ]
      expect(isDateCompleted('2025-01-16', completionDates)).toBe(false)
      expect(isDateCompleted('2025-03-01', completionDates)).toBe(false)
    })

    it('should handle empty completion dates', () => {
      expect(isDateCompleted('2025-01-15', [])).toBe(false)
    })
  })
})
