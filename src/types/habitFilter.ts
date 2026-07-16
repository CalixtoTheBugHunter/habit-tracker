/**
 * Search / filter / sort criteria for the home habit list.
 *
 * The `as const` value lists double as runtime sources for validation (e.g. in
 * `habitFilterStorage`) and as the source of the union types below.
 */

/** Completion-status filter options. */
export const COMPLETION_STATUS_FILTERS = [
  'all',
  'completed-today',
  'not-completed-today',
  'active-streak',
] as const

export type CompletionStatusFilter = (typeof COMPLETION_STATUS_FILTERS)[number]

/** Streak-range bucket options. `30+` means a streak of 31 or more (no overlap with `8-30`). */
export const STREAK_RANGE_FILTERS = ['all', '0', '1-7', '8-30', '30+'] as const

export type StreakRangeFilter = (typeof STREAK_RANGE_FILTERS)[number]

/** Sort options. `manual` preserves the saved display order (drag-and-drop order). */
export const HABIT_SORT_OPTIONS = ['manual', 'name', 'streak', 'createdDate'] as const

export type HabitSortBy = (typeof HABIT_SORT_OPTIONS)[number]

export interface HabitFilterCriteria {
  searchQuery: string
  completionStatus: CompletionStatusFilter
  streakRange: StreakRangeFilter
  sortBy: HabitSortBy
}

export const DEFAULT_HABIT_FILTER_CRITERIA: HabitFilterCriteria = {
  searchQuery: '',
  completionStatus: 'all',
  streakRange: 'all',
  sortBy: 'manual',
}
