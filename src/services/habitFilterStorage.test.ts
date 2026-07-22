import { describe, it, expect, beforeEach } from 'vitest'
import { loadHabitFilterCriteria, saveHabitFilterCriteria } from './habitFilterStorage'
import { DEFAULT_HABIT_FILTER_CRITERIA, type HabitFilterCriteria } from '../types/habitFilter'

const STORAGE_KEY = 'habitFilterCriteria'

describe('habitFilterStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the default criteria when nothing is stored', () => {
    expect(loadHabitFilterCriteria()).toEqual(DEFAULT_HABIT_FILTER_CRITERIA)
  })

  it('returns the default criteria when the stored value is invalid JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{ not json')
    expect(loadHabitFilterCriteria()).toEqual(DEFAULT_HABIT_FILTER_CRITERIA)
  })

  it('parses a fully valid stored value', () => {
    const stored: HabitFilterCriteria = {
      searchQuery: 'run',
      completionStatus: 'completed-today',
      streakRange: '8-30',
      sortBy: 'name',
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    expect(loadHabitFilterCriteria()).toEqual(stored)
  })

  it('falls back per field when individual values are invalid', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        searchQuery: 42,
        completionStatus: 'bogus',
        streakRange: '1-7',
        sortBy: 'nope',
      })
    )
    expect(loadHabitFilterCriteria()).toEqual({
      searchQuery: DEFAULT_HABIT_FILTER_CRITERIA.searchQuery,
      completionStatus: DEFAULT_HABIT_FILTER_CRITERIA.completionStatus,
      streakRange: '1-7',
      sortBy: DEFAULT_HABIT_FILTER_CRITERIA.sortBy,
    })
  })

  it('round-trips saved criteria', () => {
    const criteria: HabitFilterCriteria = {
      searchQuery: 'water',
      completionStatus: 'active-streak',
      streakRange: '30+',
      sortBy: 'streak',
    }
    saveHabitFilterCriteria(criteria)
    expect(loadHabitFilterCriteria()).toEqual(criteria)
  })

  it('writes a JSON string under the storage key', () => {
    saveHabitFilterCriteria(DEFAULT_HABIT_FILTER_CRITERIA)
    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw as string)).toEqual(DEFAULT_HABIT_FILTER_CRITERIA)
  })
})
