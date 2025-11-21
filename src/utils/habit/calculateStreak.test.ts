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
})

