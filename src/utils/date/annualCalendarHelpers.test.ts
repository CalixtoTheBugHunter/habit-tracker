import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getYearGrid,
  getWeekStartDate,
  getDateString,
  isDateCompleted,
  isExpectedGoalDay,
  isMissedGoalDay,
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
      const date = new Date(2025, 0, 15)
      expect(getDateString(date)).toBe('2025-01-15')
    })

    it('should handle month and day padding', () => {
      const date = new Date(2025, 0, 5)
      expect(getDateString(date)).toBe('2025-01-05')
    })

  })

  describe('getWeekStartDate', () => {
    it('should return the Sunday of the week for a given date', () => {
      // Wednesday, Jan 15, 2025
      const date = new Date(2025, 0, 15)
      const weekStart = getWeekStartDate(date)
      // Should be Sunday, Jan 12, 2025
      expect(weekStart.getDate()).toBe(12)
      expect(weekStart.getDay()).toBe(0) // Sunday
    })

    it('should return the same date if it is already Sunday', () => {
      const date = new Date(2025, 0, 12) // Sunday
      const weekStart = getWeekStartDate(date)
      expect(weekStart.getDate()).toBe(12)
      expect(weekStart.getDay()).toBe(0)
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
      expect(firstWeek).toBeDefined()
      const firstDay = firstWeek?.[0]
      expect(firstDay).toBeDefined()
      // Jan 1, 2025 is a Wednesday, so first Sunday should be Dec 29, 2024
      expect(firstDay!.getFullYear()).toBe(2024)
      expect(firstDay!.getMonth()).toBe(11) // December (0-indexed)
      expect(firstDay!.getDate()).toBe(29)
      expect(firstDay!.getDay()).toBe(0) // Sunday
    })

    it('should have consecutive dates', () => {
      const grid = getYearGrid(2025)
      const allDays = grid.flat()
      for (let i = 1; i < allDays.length; i++) {
        const prev = allDays[i - 1]
        const curr = allDays[i]
        expect(prev).toBeDefined()
        expect(curr).toBeDefined()
        const expectedNext = new Date(prev!)
        expectedNext.setDate(expectedNext.getDate() + 1)
        expect(curr!.getTime()).toBe(expectedNext.getTime())
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

  describe('isExpectedGoalDay', () => {
    // 2025-11-17 is a Monday (getDay() === 1)
    const monday = new Date(2025, 10, 17)

    it('should return false when goalDays is undefined', () => {
      expect(isExpectedGoalDay(monday, undefined)).toBe(false)
    })

    it('should return false when goalDays is empty', () => {
      expect(isExpectedGoalDay(monday, [])).toBe(false)
    })

    it("should return true when the date's weekday is in goalDays", () => {
      expect(isExpectedGoalDay(monday, [1])).toBe(true)
      expect(isExpectedGoalDay(monday, [1, 3, 5])).toBe(true)
    })

    it("should return false when the date's weekday is not in goalDays", () => {
      expect(isExpectedGoalDay(monday, [2, 4])).toBe(false)
    })
  })

  describe('isMissedGoalDay', () => {
    // System time is fixed to 2025-11-19 (Wednesday). Local "today" is 2025-11-19.
    const today = '2025-11-19'
    const createdEarly = '2025-01-01T00:00:00.000Z'
    // 2025-11-17 Monday(1), 2025-11-18 Tuesday(2), 2025-11-19 Wednesday(3), 2025-11-21 Friday(5)
    const pastMonday = new Date(2025, 10, 17)
    const pastMondayStr = getDateString(pastMonday)

    it('should return false when the habit has no goalDays (daily, backward compatible)', () => {
      expect(
        isMissedGoalDay(pastMonday, pastMondayStr, today, createdEarly, [], undefined)
      ).toBe(false)
    })

    it('should return true for a past, uncompleted goal day after the created date', () => {
      expect(
        isMissedGoalDay(pastMonday, pastMondayStr, today, createdEarly, [], [1])
      ).toBe(true)
    })

    it('should return false when the goal day was completed', () => {
      expect(
        isMissedGoalDay(
          pastMonday,
          pastMondayStr,
          today,
          createdEarly,
          [`${pastMondayStr}T00:00:00.000Z`],
          [1]
        )
      ).toBe(false)
    })

    it('should return false for a future goal day', () => {
      const futureFriday = new Date(2025, 10, 21)
      const futureFridayStr = getDateString(futureFriday)
      expect(
        isMissedGoalDay(futureFriday, futureFridayStr, today, createdEarly, [], [5])
      ).toBe(false)
    })

    it('should return false for today (not strictly in the past)', () => {
      const todayDate = new Date(2025, 10, 19)
      expect(
        isMissedGoalDay(todayDate, today, today, createdEarly, [], [3])
      ).toBe(false)
    })

    it('should return false for a non-goal weekday', () => {
      const pastTuesday = new Date(2025, 10, 18)
      const pastTuesdayStr = getDateString(pastTuesday)
      expect(
        isMissedGoalDay(pastTuesday, pastTuesdayStr, today, createdEarly, [], [1])
      ).toBe(false)
    })

    it('should return false for a date before the habit was created', () => {
      expect(
        isMissedGoalDay(pastMonday, pastMondayStr, today, '2025-11-18T00:00:00.000Z', [], [1])
      ).toBe(false)
    })
  })
})
