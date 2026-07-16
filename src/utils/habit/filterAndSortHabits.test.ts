import { describe, it, expect } from 'vitest'
import { filterAndSortHabits } from './filterAndSortHabits'
import { createMockHabit } from '../../test/fixtures/habits'
import { DEFAULT_HABIT_FILTER_CRITERIA, type HabitFilterCriteria } from '../../types/habitFilter'
import type { Habit } from '../../types/habit'

type ListHabit = Habit & { streak: number; completedToday: boolean }

function makeHabit(overrides: Partial<ListHabit>): ListHabit {
  return {
    ...createMockHabit(overrides),
    streak: overrides.streak ?? 0,
    completedToday: overrides.completedToday ?? false,
  }
}

function criteria(overrides: Partial<HabitFilterCriteria>): HabitFilterCriteria {
  return { ...DEFAULT_HABIT_FILTER_CRITERIA, ...overrides }
}

describe('filterAndSortHabits', () => {
  describe('search', () => {
    const run = makeHabit({ id: '1', name: 'Morning Run', description: 'Jog around the park' })
    const read = makeHabit({ id: '2', name: 'Read', description: 'Read a book' })
    const habits = [run, read]

    it('returns all habits when the query is empty', () => {
      expect(filterAndSortHabits(habits, criteria({ searchQuery: '' }))).toEqual(habits)
    })

    it('returns all habits when the query is only whitespace', () => {
      expect(filterAndSortHabits(habits, criteria({ searchQuery: '   ' }))).toEqual(habits)
    })

    it('matches the name case-insensitively', () => {
      expect(filterAndSortHabits(habits, criteria({ searchQuery: 'MORNING' }))).toEqual([run])
    })

    it('matches the description', () => {
      expect(filterAndSortHabits(habits, criteria({ searchQuery: 'book' }))).toEqual([read])
    })

    it('returns an empty array when nothing matches', () => {
      expect(filterAndSortHabits(habits, criteria({ searchQuery: 'swim' }))).toEqual([])
    })
  })

  describe('completion status', () => {
    const done = makeHabit({ id: '1', name: 'Done', completedToday: true, streak: 3 })
    const notDone = makeHabit({ id: '2', name: 'NotDone', completedToday: false, streak: 0 })
    const streaking = makeHabit({ id: '3', name: 'Streaking', completedToday: false, streak: 5 })
    const habits = [done, notDone, streaking]

    it('returns all with "all"', () => {
      expect(filterAndSortHabits(habits, criteria({ completionStatus: 'all' }))).toEqual(habits)
    })

    it('filters completed today', () => {
      expect(filterAndSortHabits(habits, criteria({ completionStatus: 'completed-today' }))).toEqual([
        done,
      ])
    })

    it('filters not completed today', () => {
      expect(
        filterAndSortHabits(habits, criteria({ completionStatus: 'not-completed-today' }))
      ).toEqual([notDone, streaking])
    })

    it('filters active streak (streak > 0)', () => {
      expect(filterAndSortHabits(habits, criteria({ completionStatus: 'active-streak' }))).toEqual([
        done,
        streaking,
      ])
    })
  })

  describe('streak range', () => {
    const zero = makeHabit({ id: '1', streak: 0 })
    const seven = makeHabit({ id: '2', streak: 7 })
    const eight = makeHabit({ id: '3', streak: 8 })
    const thirty = makeHabit({ id: '4', streak: 30 })
    const thirtyOne = makeHabit({ id: '5', streak: 31 })
    const habits = [zero, seven, eight, thirty, thirtyOne]

    it('filters exactly 0', () => {
      expect(filterAndSortHabits(habits, criteria({ streakRange: '0' }))).toEqual([zero])
    })

    it('filters 1-7 (7 included, 8 excluded)', () => {
      expect(filterAndSortHabits(habits, criteria({ streakRange: '1-7' }))).toEqual([seven])
    })

    it('filters 8-30 (8 and 30 included, 31 excluded)', () => {
      expect(filterAndSortHabits(habits, criteria({ streakRange: '8-30' }))).toEqual([eight, thirty])
    })

    it('filters 30+ (31 and up only)', () => {
      expect(filterAndSortHabits(habits, criteria({ streakRange: '30+' }))).toEqual([thirtyOne])
    })
  })

  describe('sort', () => {
    const a = makeHabit({ id: '1', name: 'Banana', streak: 2, createdDate: '2026-01-01T00:00:00.000Z' })
    const b = makeHabit({ id: '2', name: 'apple', streak: 10, createdDate: '2026-03-01T00:00:00.000Z' })
    const c = makeHabit({ id: '3', name: 'Cherry', streak: 5, createdDate: '2026-02-01T00:00:00.000Z' })
    const habits = [a, b, c]

    it('preserves input order with "manual"', () => {
      expect(filterAndSortHabits(habits, criteria({ sortBy: 'manual' }))).toEqual([a, b, c])
    })

    it('sorts by name A→Z case-insensitively', () => {
      expect(filterAndSortHabits(habits, criteria({ sortBy: 'name' }))).toEqual([b, a, c])
    })

    it('sorts by streak high→low', () => {
      expect(filterAndSortHabits(habits, criteria({ sortBy: 'streak' }))).toEqual([b, c, a])
    })

    it('sorts by creation date newest first', () => {
      expect(filterAndSortHabits(habits, criteria({ sortBy: 'createdDate' }))).toEqual([b, c, a])
    })

    it('does not mutate the input array', () => {
      const input = [a, b, c]
      filterAndSortHabits(input, criteria({ sortBy: 'name' }))
      expect(input).toEqual([a, b, c])
    })
  })

  it('applies search, status, streak, and sort together', () => {
    const match1 = makeHabit({ id: '1', name: 'Read fiction', streak: 12, completedToday: false })
    const match2 = makeHabit({ id: '2', name: 'Read news', streak: 20, completedToday: false })
    const wrongStreak = makeHabit({ id: '3', name: 'Read poetry', streak: 3, completedToday: false })
    const wrongStatus = makeHabit({ id: '4', name: 'Read manga', streak: 15, completedToday: true })
    const wrongSearch = makeHabit({ id: '5', name: 'Run', streak: 15, completedToday: false })
    const habits = [match1, match2, wrongStreak, wrongStatus, wrongSearch]

    const result = filterAndSortHabits(
      habits,
      criteria({
        searchQuery: 'read',
        completionStatus: 'not-completed-today',
        streakRange: '8-30',
        sortBy: 'streak',
      })
    )

    expect(result).toEqual([match2, match1])
  })
})
