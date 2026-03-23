import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  areAllStackedHabitsCompletedForToday,
  hasAutoCompletedForToday,
  syncParentMainCompletionWithStackingState,
  stripTodayFromAutoCompletedDates,
} from './checkAutoCompletion'
import { createMockHabit } from '../../test/fixtures/habits'
import { createDateString } from '../../test/utils/date-helpers'

describe('checkAutoCompletion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('areAllStackedHabitsCompletedForToday', () => {
    it('returns false when stacking list is missing', () => {
      const parent = createMockHabit({ id: 'p' })
      expect(areAllStackedHabitsCompletedForToday(parent, [])).toBe(false)
    })

    it('returns false when stacking list is empty', () => {
      const parent = createMockHabit({ id: 'p', stackingHabits: [] })
      expect(areAllStackedHabitsCompletedForToday(parent, [])).toBe(false)
    })

    it('returns false when one resolved child is not done today', () => {
      const today = createDateString(0)
      const parent = createMockHabit({ id: 'p', stackingHabits: ['a', 'b'] })
      const a = createMockHabit({ id: 'a', completionDates: [today] })
      const b = createMockHabit({ id: 'b', completionDates: [] })
      expect(areAllStackedHabitsCompletedForToday(parent, [a, b])).toBe(false)
    })

    it('returns true when all resolved children are done today', () => {
      const today = createDateString(0)
      const parent = createMockHabit({ id: 'p', stackingHabits: ['a', 'b'] })
      const a = createMockHabit({ id: 'a', completionDates: [today] })
      const b = createMockHabit({ id: 'b', completionDates: [today] })
      expect(areAllStackedHabitsCompletedForToday(parent, [a, b])).toBe(true)
    })

    it('uses stackingCompletions when resolved habit is undefined', () => {
      const today = createDateString(0)
      const parent = createMockHabit({
        id: 'p',
        stackingHabits: ['step-1'],
        stackingCompletions: { 'step-1': [today] },
      })
      expect(areAllStackedHabitsCompletedForToday(parent, [undefined])).toBe(true)
    })
  })

  describe('hasAutoCompletedForToday', () => {
    it('returns false when autoCompletedDates is missing', () => {
      expect(hasAutoCompletedForToday(createMockHabit({}))).toBe(false)
    })

    it('returns true when an entry matches today', () => {
      const habit = createMockHabit({
        autoCompletedDates: [createDateString(0)],
      })
      expect(hasAutoCompletedForToday(habit)).toBe(true)
    })

    it('throws when autoCompletedDates contains an invalid date string', () => {
      const habit = createMockHabit({
        autoCompletedDates: ['not-a-date'],
      })
      expect(() => hasAutoCompletedForToday(habit)).toThrow(/Invalid date string/)
    })
  })

  describe('syncParentMainCompletionWithStackingState', () => {
    it('returns same reference when no stacking list', () => {
      const parent = createMockHabit({ id: 'p' })
      expect(syncParentMainCompletionWithStackingState(parent, [])).toBe(parent)
    })

    it('adds completion and auto when all stacked done and parent not complete', () => {
      const today = createDateString(0)
      const parent = createMockHabit({
        id: 'p',
        stackingHabits: ['a'],
        completionDates: [],
      })
      const a = createMockHabit({ id: 'a', completionDates: [today] })
      const result = syncParentMainCompletionWithStackingState(parent, [a])
      expect(result).not.toBe(parent)
      expect(result.completionDates).toContain(today)
      expect(result.autoCompletedDates).toContain(today)
    })

    it('returns unchanged when parent already complete today', () => {
      const today = createDateString(0)
      const parent = createMockHabit({
        id: 'p',
        stackingHabits: ['a'],
        completionDates: [today],
      })
      const a = createMockHabit({ id: 'a', completionDates: [today] })
      expect(syncParentMainCompletionWithStackingState(parent, [a])).toBe(parent)
    })

    it('removes today from completion and auto when not all done and was auto-completed', () => {
      const today = createDateString(0)
      const parent = createMockHabit({
        id: 'p',
        stackingHabits: ['a', 'b'],
        completionDates: [today],
        autoCompletedDates: [today],
      })
      const a = createMockHabit({ id: 'a', completionDates: [today] })
      const b = createMockHabit({ id: 'b', completionDates: [] })
      const result = syncParentMainCompletionWithStackingState(parent, [a, b])
      expect(result.completionDates).toHaveLength(0)
      expect(result.autoCompletedDates).toBeUndefined()
    })

    it('does not remove main completion when complete today but not auto', () => {
      const today = createDateString(0)
      const parent = createMockHabit({
        id: 'p',
        stackingHabits: ['a', 'b'],
        completionDates: [today],
      })
      const a = createMockHabit({ id: 'a', completionDates: [today] })
      const b = createMockHabit({ id: 'b', completionDates: [] })
      expect(syncParentMainCompletionWithStackingState(parent, [a, b])).toBe(parent)
    })
  })

  describe('stripTodayFromAutoCompletedDates', () => {
    it('returns same reference when no auto dates', () => {
      const h = createMockHabit({})
      expect(stripTodayFromAutoCompletedDates(h)).toBe(h)
    })

    it('removes only today from autoCompletedDates', () => {
      const today = createDateString(0)
      const yesterday = createDateString(1)
      const h = createMockHabit({
        autoCompletedDates: [today, yesterday],
      })
      const result = stripTodayFromAutoCompletedDates(h)
      expect(result.autoCompletedDates).toEqual([yesterday])
    })

    it('sets autoCompletedDates undefined when empty after strip', () => {
      const today = createDateString(0)
      const h = createMockHabit({ autoCompletedDates: [today] })
      const result = stripTodayFromAutoCompletedDates(h)
      expect(result.autoCompletedDates).toBeUndefined()
    })
  })
})
