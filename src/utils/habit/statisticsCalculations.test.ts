import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateLongestStreak,
  calculateCompletionRate,
  calculateTotalDaysTracked,
  calculateWeeklyCompletionRate,
  calculateMonthlyCompletionRate,
  calculateGoalProgress,
} from './statisticsCalculations'


describe('statisticsCalculations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('calculateLongestStreak', () => {
    it('should return 0 for empty completion dates', () => {
      expect(calculateLongestStreak([])).toBe(0)
    })

    it('should return 1 for a single completion date', () => {
      expect(calculateLongestStreak(['2025-01-10T00:00:00.000Z'])).toBe(1)
    })

    it('should calculate longest streak for consecutive dates', () => {
      const dates = [
        '2025-01-10T00:00:00.000Z',
        '2025-01-11T00:00:00.000Z',
        '2025-01-12T00:00:00.000Z',
      ]
      expect(calculateLongestStreak(dates)).toBe(3)
    })

    it('should find the longest streak when there are gaps', () => {
      const dates = [
        '2025-01-01T00:00:00.000Z',
        '2025-01-02T00:00:00.000Z',
        // gap
        '2025-01-05T00:00:00.000Z',
        '2025-01-06T00:00:00.000Z',
        '2025-01-07T00:00:00.000Z',
        '2025-01-08T00:00:00.000Z',
      ]
      expect(calculateLongestStreak(dates)).toBe(4)
    })

    it('should handle duplicate dates', () => {
      const dates = [
        '2025-01-10T08:00:00.000Z',
        '2025-01-10T20:00:00.000Z',
        '2025-01-11T00:00:00.000Z',
        '2025-01-12T00:00:00.000Z',
      ]
      expect(calculateLongestStreak(dates)).toBe(3)
    })

    it('should handle unsorted dates', () => {
      const dates = [
        '2025-01-12T00:00:00.000Z',
        '2025-01-10T00:00:00.000Z',
        '2025-01-11T00:00:00.000Z',
      ]
      expect(calculateLongestStreak(dates)).toBe(3)
    })

    it('should return 1 when all dates are non-consecutive', () => {
      const dates = [
        '2025-01-01T00:00:00.000Z',
        '2025-01-05T00:00:00.000Z',
        '2025-01-10T00:00:00.000Z',
      ]
      expect(calculateLongestStreak(dates)).toBe(1)
    })

    it('should handle long streaks', () => {
      const dates: string[] = []
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-01T12:00:00.000Z')
        date.setDate(date.getDate() + i)
        dates.push(date.toISOString())
      }
      expect(calculateLongestStreak(dates)).toBe(30)
    })
  })

  describe('calculateCompletionRate', () => {
    it('should return 0 for empty completion dates', () => {
      expect(calculateCompletionRate([], '2025-01-01T00:00:00.000Z')).toBe(0)
    })

    it('should calculate correct rate for partial completions', () => {
      // 15 days tracked (Jan 1 to Jan 15), 5 completions = 33%
      const dates = [
        '2025-01-01T00:00:00.000Z',
        '2025-01-03T00:00:00.000Z',
        '2025-01-05T00:00:00.000Z',
        '2025-01-07T00:00:00.000Z',
        '2025-01-09T00:00:00.000Z',
      ]
      expect(calculateCompletionRate(dates, '2025-01-01T00:00:00.000Z')).toBe(33)
    })

    it('should return 100 when all days are completed', () => {
      const dates = [
        '2025-01-14T00:00:00.000Z',
        '2025-01-15T00:00:00.000Z',
      ]
      expect(calculateCompletionRate(dates, '2025-01-14T00:00:00.000Z')).toBe(100)
    })

    it('should cap at 100 even with duplicate dates', () => {
      const dates = [
        '2025-01-15T08:00:00.000Z',
        '2025-01-15T20:00:00.000Z',
      ]
      expect(calculateCompletionRate(dates, '2025-01-15T00:00:00.000Z')).toBe(100)
    })

    it('should return 0 when createdDate is in the future', () => {
      expect(calculateCompletionRate(['2025-01-20T00:00:00.000Z'], '2025-01-20T00:00:00.000Z')).toBe(0)
    })
  })

  describe('calculateTotalDaysTracked', () => {
    it('should return 1 when created today', () => {
      expect(calculateTotalDaysTracked('2025-01-15T00:00:00.000Z')).toBe(1)
    })

    it('should count days inclusive of start and end', () => {
      // Jan 10 to Jan 15 = 6 days
      expect(calculateTotalDaysTracked('2025-01-10T00:00:00.000Z')).toBe(6)
    })

    it('should handle creation date at start of year', () => {
      // Jan 1 to Jan 15 = 15 days
      expect(calculateTotalDaysTracked('2025-01-01T00:00:00.000Z')).toBe(15)
    })

    it('should return 0 when created in the future', () => {
      expect(calculateTotalDaysTracked('2025-01-20T00:00:00.000Z')).toBe(0)
    })
  })

  describe('calculateWeeklyCompletionRate', () => {
    it('should return 0 for empty completion dates', () => {
      expect(calculateWeeklyCompletionRate([])).toBe(0)
    })

    it('should return 100 when all 7 days are completed', () => {
      const dates = [
        '2025-01-09T00:00:00.000Z',
        '2025-01-10T00:00:00.000Z',
        '2025-01-11T00:00:00.000Z',
        '2025-01-12T00:00:00.000Z',
        '2025-01-13T00:00:00.000Z',
        '2025-01-14T00:00:00.000Z',
        '2025-01-15T00:00:00.000Z',
      ]
      expect(calculateWeeklyCompletionRate(dates)).toBe(100)
    })

    it('should only count dates within the last 7 days', () => {
      const dates = [
        '2025-01-01T00:00:00.000Z', // outside window
        '2025-01-08T00:00:00.000Z', // outside window (8 days ago)
        '2025-01-14T00:00:00.000Z', // within window
        '2025-01-15T00:00:00.000Z', // within window
      ]
      expect(calculateWeeklyCompletionRate(dates)).toBe(29) // 2/7 = 28.57 rounded
    })

    it('should calculate correct rate for partial week', () => {
      const dates = [
        '2025-01-13T00:00:00.000Z',
        '2025-01-14T00:00:00.000Z',
        '2025-01-15T00:00:00.000Z',
      ]
      expect(calculateWeeklyCompletionRate(dates)).toBe(43) // 3/7 = 42.86 rounded
    })
  })

  describe('calculateMonthlyCompletionRate', () => {
    it('should return 0 for empty completion dates', () => {
      expect(calculateMonthlyCompletionRate([])).toBe(0)
    })

    it('should only count dates within the last 30 days', () => {
      const dates = [
        '2024-12-10T00:00:00.000Z', // outside window (36 days ago)
        '2024-12-20T00:00:00.000Z', // within window
        '2025-01-10T00:00:00.000Z', // within window
        '2025-01-15T00:00:00.000Z', // within window
      ]
      expect(calculateMonthlyCompletionRate(dates)).toBe(10) // 3/30 = 10
    })

    it('should return 100 when all 30 days are completed', () => {
      const dates: string[] = []
      for (let i = 0; i < 30; i++) {
        const date = new Date('2025-01-15T12:00:00.000Z')
        date.setDate(date.getDate() - i)
        dates.push(date.toISOString())
      }
      expect(calculateMonthlyCompletionRate(dates)).toBe(100)
    })

    it('should calculate correct rate for sparse completions', () => {
      // 10 completions in last 30 days = 33%
      const dates: string[] = []
      for (let i = 0; i < 10; i++) {
        const date = new Date('2025-01-15T12:00:00.000Z')
        date.setDate(date.getDate() - (i * 3))
        dates.push(date.toISOString())
      }
      expect(calculateMonthlyCompletionRate(dates)).toBe(33) // 10/30 = 33.33 rounded
    })
  })

  describe('calculateGoalProgress', () => {
    // Fake time: 2025-01-15 (Wednesday). ISO week: Mon 2025-01-13 – Sun 2025-01-19.
    // goalDays uses JS weekday numbers: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Mon/Wed/Fri = [1, 3, 5] → dates 2025-01-13, 2025-01-15, 2025-01-17

    it('should return 0 completed and 0% for empty dates', () => {
      expect(calculateGoalProgress([], [1, 3, 5])).toEqual({ completed: 0, target: 3, percentage: 0 })
    })

    it('should count completions on goal days within the current ISO week', () => {
      const dates = [
        '2025-01-13T00:00:00.000Z', // Monday (1) — goal day ✓
        '2025-01-15T00:00:00.000Z', // Wednesday (3) — goal day ✓
        '2025-01-12T00:00:00.000Z', // Sunday previous week — NOT in current week
      ]
      // Fri (2025-01-17) not yet completed
      expect(calculateGoalProgress(dates, [1, 3, 5])).toEqual({ completed: 2, target: 3, percentage: 67 })
    })

    it('should return 100% when all goal days are completed', () => {
      const dates = [
        '2025-01-13T00:00:00.000Z', // Mon
        '2025-01-15T00:00:00.000Z', // Wed
        '2025-01-17T00:00:00.000Z', // Fri
      ]
      expect(calculateGoalProgress(dates, [1, 3, 5])).toEqual({ completed: 3, target: 3, percentage: 100 })
    })

    it('should ignore completions from the previous week', () => {
      const dates = [
        '2025-01-06T00:00:00.000Z', // Mon of previous week
        '2025-01-08T00:00:00.000Z', // Wed of previous week
        '2025-01-10T00:00:00.000Z', // Fri of previous week
      ]
      expect(calculateGoalProgress(dates, [1, 3, 5])).toEqual({ completed: 0, target: 3, percentage: 0 })
    })

    it('should correctly map Sunday (0) to 2025-01-19 in the current ISO week', () => {
      const dates = [
        '2025-01-19T00:00:00.000Z', // Sunday of current ISO week
      ]
      expect(calculateGoalProgress(dates, [0])).toEqual({ completed: 1, target: 1, percentage: 100 })
    })

    it('should not count completions on non-goal days', () => {
      const dates = [
        '2025-01-14T00:00:00.000Z', // Tuesday — not a goal day for [1,3,5]
        '2025-01-16T00:00:00.000Z', // Thursday — not a goal day for [1,3,5]
      ]
      expect(calculateGoalProgress(dates, [1, 3, 5])).toEqual({ completed: 0, target: 3, percentage: 0 })
    })
  })
})
