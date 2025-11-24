import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toggleCompletion } from './toggleCompletion'
import { createMockHabit } from '../../test/fixtures/habits'
import { createDateString } from '../../test/utils/date-helpers'

describe('toggleCompletion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should add today to completionDates when habit is not completed today', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const habit = createMockHabit({
      id: '1',
      completionDates: [],
    })

    const result = toggleCompletion(habit)

    expect(result.completionDates).toHaveLength(1)
    expect(result.completionDates[0]).toMatch(/^2025-01-15T/)
  })

  it('should remove today from completionDates when habit is already completed today', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const today = createDateString(0)
    const habit = createMockHabit({
      id: '1',
      completionDates: [today],
    })

    const result = toggleCompletion(habit)

    expect(result.completionDates).toHaveLength(0)
  })

  it('should preserve other completion dates when adding today', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const yesterday = createDateString(1)
    const habit = createMockHabit({
      id: '1',
      completionDates: [yesterday],
    })

    const result = toggleCompletion(habit)

    expect(result.completionDates).toHaveLength(2)
    expect(result.completionDates).toContain(yesterday)
    expect(result.completionDates.some(d => d.startsWith('2025-01-15'))).toBe(true)
  })

  it('should preserve other completion dates when removing today', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const today = createDateString(0)
    const yesterday = createDateString(1)
    const habit = createMockHabit({
      id: '1',
      completionDates: [today, yesterday],
    })

    const result = toggleCompletion(habit)

    expect(result.completionDates).toHaveLength(1)
    expect(result.completionDates).toContain(yesterday)
    expect(result.completionDates).not.toContain(today)
  })

  it('should remove all duplicate entries for today when toggling off', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const today1 = '2025-01-15T08:00:00.000Z'
    const today2 = '2025-01-15T20:00:00.000Z'
    const habit = createMockHabit({
      id: '1',
      completionDates: [today1, today2],
    })

    const result = toggleCompletion(habit)

    expect(result.completionDates).toHaveLength(0)
  })

  it('should not add duplicate when today already exists with different time', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const today = '2025-01-15T08:00:00.000Z'
    const habit = createMockHabit({
      id: '1',
      completionDates: [today],
    })

    const result = toggleCompletion(habit)

    expect(result.completionDates).toHaveLength(0)
  })

  it('should return a new habit object without mutating the original', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const habit = createMockHabit({
      id: '1',
      completionDates: [],
    })

    const result = toggleCompletion(habit)

    expect(result).not.toBe(habit)
    expect(habit.completionDates).toHaveLength(0)
    expect(result.completionDates).toHaveLength(1)
  })

  it('should preserve all other habit properties', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
    const habit = createMockHabit({
      id: 'test-id',
      name: 'Test Habit',
      description: 'Test Description',
      createdDate: '2025-01-01T00:00:00.000Z',
      completionDates: [],
    })

    const result = toggleCompletion(habit)

    expect(result.id).toBe(habit.id)
    expect(result.name).toBe(habit.name)
    expect(result.description).toBe(habit.description)
    expect(result.createdDate).toBe(habit.createdDate)
  })
})

