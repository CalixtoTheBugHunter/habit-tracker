import {
  COMPLETION_STATUS_FILTERS,
  STREAK_RANGE_FILTERS,
  HABIT_SORT_OPTIONS,
  DEFAULT_HABIT_FILTER_CRITERIA,
  type CompletionStatusFilter,
  type StreakRangeFilter,
  type HabitSortBy,
  type HabitFilterCriteria,
} from '../types/habitFilter'

const HABIT_FILTER_STORAGE_KEY = 'habitFilterCriteria'

function isCompletionStatus(value: unknown): value is CompletionStatusFilter {
  return (COMPLETION_STATUS_FILTERS as readonly string[]).includes(value as string)
}

function isStreakRange(value: unknown): value is StreakRangeFilter {
  return (STREAK_RANGE_FILTERS as readonly string[]).includes(value as string)
}

function isSortBy(value: unknown): value is HabitSortBy {
  return (HABIT_SORT_OPTIONS as readonly string[]).includes(value as string)
}

/**
 * Loads persisted filter criteria from localStorage, validating each field and
 * falling back to the default for any missing or invalid value. Returns a fresh
 * default object when storage is unavailable or the stored value is unparseable.
 */
export function loadHabitFilterCriteria(): HabitFilterCriteria {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_HABIT_FILTER_CRITERIA }
    }
    const raw = window.localStorage.getItem(HABIT_FILTER_STORAGE_KEY)
    if (raw === null) {
      return { ...DEFAULT_HABIT_FILTER_CRITERIA }
    }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      return { ...DEFAULT_HABIT_FILTER_CRITERIA }
    }
    const value = parsed as Record<string, unknown>
    return {
      searchQuery:
        typeof value.searchQuery === 'string'
          ? value.searchQuery
          : DEFAULT_HABIT_FILTER_CRITERIA.searchQuery,
      completionStatus: isCompletionStatus(value.completionStatus)
        ? value.completionStatus
        : DEFAULT_HABIT_FILTER_CRITERIA.completionStatus,
      streakRange: isStreakRange(value.streakRange)
        ? value.streakRange
        : DEFAULT_HABIT_FILTER_CRITERIA.streakRange,
      sortBy: isSortBy(value.sortBy) ? value.sortBy : DEFAULT_HABIT_FILTER_CRITERIA.sortBy,
    }
  } catch {
    return { ...DEFAULT_HABIT_FILTER_CRITERIA }
  }
}

/**
 * Persists filter criteria to localStorage. Silently ignores failures (e.g.
 * Safari private mode or storage disabled).
 */
export function saveHabitFilterCriteria(criteria: HabitFilterCriteria): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    window.localStorage.setItem(HABIT_FILTER_STORAGE_KEY, JSON.stringify(criteria))
  } catch {
    // Storage unavailable: ignore.
  }
}
