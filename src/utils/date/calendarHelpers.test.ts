import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getCalendarGrid,
  isDateInMonth,
  formatMonthYear,
} from './calendarHelpers'

describe('calendarHelpers', () => {
  describe('getDaysInMonth', () => {
    it('should return correct number of days for each month', () => {
      expect(getDaysInMonth(2025, 1)).toBe(31) // January
      expect(getDaysInMonth(2025, 2)).toBe(28) // February (non-leap)
      expect(getDaysInMonth(2025, 3)).toBe(31) // March
      expect(getDaysInMonth(2025, 4)).toBe(30) // April
      expect(getDaysInMonth(2025, 5)).toBe(31) // May
      expect(getDaysInMonth(2025, 6)).toBe(30) // June
      expect(getDaysInMonth(2025, 7)).toBe(31) // July
      expect(getDaysInMonth(2025, 8)).toBe(31) // August
      expect(getDaysInMonth(2025, 9)).toBe(30) // September
      expect(getDaysInMonth(2025, 10)).toBe(31) // October
      expect(getDaysInMonth(2025, 11)).toBe(30) // November
      expect(getDaysInMonth(2025, 12)).toBe(31) // December
    })

    it('should handle leap year February', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29) // Leap year
      expect(getDaysInMonth(2020, 2)).toBe(29) // Leap year
      expect(getDaysInMonth(2025, 2)).toBe(28) // Non-leap year
    })
  })

  describe('getFirstDayOfMonth', () => {
    it('should return day of week for first day of month (0=Sunday, 6=Saturday)', () => {
      // January 1, 2025 is a Wednesday (3)
      expect(getFirstDayOfMonth(2025, 1)).toBe(3)
    })

    it('should handle different months correctly', () => {
      // February 1, 2025 is a Saturday (6)
      expect(getFirstDayOfMonth(2025, 2)).toBe(6)
      // March 1, 2025 is a Saturday (6)
      expect(getFirstDayOfMonth(2025, 3)).toBe(6)
    })
  })

  describe('getCalendarGrid', () => {
    it('should always return 6 weeks for consistent display', () => {
      const gridFeb = getCalendarGrid(2025, 2) // February 2025
      expect(gridFeb.length).toBe(6)
      
      const gridJun = getCalendarGrid(2025, 6) // June 2025
      expect(gridJun.length).toBe(6)
    })

    it('should return 7 days per week', () => {
      const grid = getCalendarGrid(2025, 1)
      grid.forEach(week => {
        expect(week.length).toBe(7)
      })
    })

    it('should start with correct first day of month', () => {
      const grid = getCalendarGrid(2025, 1) // January 2025 starts on Wednesday
      expect(grid[0][3].getUTCDate()).toBe(1) // First day is in position 3 (Wednesday)
    })

    it('should include days from previous month in first week', () => {
      const grid = getCalendarGrid(2025, 1) // January 2025
      // First week should include days from December 2024
      expect(grid[0][0].getUTCMonth()).toBe(11) // December (0-indexed)
    })

    it('should include days from next month in last week', () => {
      const grid = getCalendarGrid(2025, 1) // January 2025
      const lastWeek = grid[grid.length - 1]
      // Last week should include days from February 2025
      const hasNextMonth = lastWeek.some(day => day.getUTCMonth() === 1) // February (0-indexed)
      expect(hasNextMonth).toBe(true)
    })

    it('should have all dates in correct order', () => {
      const grid = getCalendarGrid(2025, 1)
      let previousDate: Date | null = null
      for (const week of grid) {
        for (const day of week) {
          if (previousDate) {
            const dayDiff = (day.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
            expect(dayDiff).toBe(1) // Each day should be 1 day after previous
          }
          previousDate = day
        }
      }
    })
  })

  describe('isDateInMonth', () => {
    it('should return true for dates in the specified month', () => {
      expect(isDateInMonth('2025-01-15T00:00:00.000Z', 2025, 1)).toBe(true)
      expect(isDateInMonth('2025-02-28T00:00:00.000Z', 2025, 2)).toBe(true)
    })

    it('should return false for dates in different months', () => {
      expect(isDateInMonth('2025-02-15T00:00:00.000Z', 2025, 1)).toBe(false)
      expect(isDateInMonth('2025-01-15T00:00:00.000Z', 2025, 2)).toBe(false)
    })

    it('should return false for dates in different years', () => {
      expect(isDateInMonth('2024-01-15T00:00:00.000Z', 2025, 1)).toBe(false)
      expect(isDateInMonth('2026-01-15T00:00:00.000Z', 2025, 1)).toBe(false)
    })

    it('should handle edge cases at month boundaries', () => {
      expect(isDateInMonth('2025-01-31T00:00:00.000Z', 2025, 1)).toBe(true)
      expect(isDateInMonth('2025-02-01T00:00:00.000Z', 2025, 1)).toBe(false)
      expect(isDateInMonth('2025-01-01T00:00:00.000Z', 2025, 1)).toBe(true)
    })
  })

  describe('formatMonthYear', () => {
    it('should format month and year correctly', () => {
      expect(formatMonthYear(2025, 1)).toBe('January 2025')
      expect(formatMonthYear(2025, 2)).toBe('February 2025')
      expect(formatMonthYear(2025, 12)).toBe('December 2025')
    })

    it('should handle different years', () => {
      expect(formatMonthYear(2024, 1)).toBe('January 2024')
      expect(formatMonthYear(2026, 6)).toBe('June 2026')
    })
  })
})

