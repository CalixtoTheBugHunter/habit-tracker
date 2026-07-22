import type { Habit } from '../../types/habit'
import type { HabitFilterCriteria } from '../../types/habitFilter'

type FilterableHabit = Pick<Habit, 'name' | 'description' | 'createdDate'> & {
  streak: number
  completedToday: boolean
}

function matchesSearch(habit: FilterableHabit, query: string): boolean {
  const name = (habit.name ?? '').toLowerCase()
  const description = (habit.description ?? '').toLowerCase()
  return name.includes(query) || description.includes(query)
}

function matchesCompletionStatus(
  habit: FilterableHabit,
  status: HabitFilterCriteria['completionStatus']
): boolean {
  switch (status) {
    case 'completed-today':
      return habit.completedToday
    case 'not-completed-today':
      return !habit.completedToday
    case 'active-streak':
      return habit.streak > 0
    case 'all':
    default:
      return true
  }
}

function matchesStreakRange(
  habit: FilterableHabit,
  range: HabitFilterCriteria['streakRange']
): boolean {
  switch (range) {
    case '0':
      return habit.streak === 0
    case '1-7':
      return habit.streak >= 1 && habit.streak <= 7
    case '8-30':
      return habit.streak >= 8 && habit.streak <= 30
    case '30+':
      return habit.streak >= 31
    case 'all':
    default:
      return true
  }
}

function compareByName(a: FilterableHabit, b: FilterableHabit): number {
  return (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
}

/**
 * Applies the search / completion-status / streak-range filters and then the
 * chosen sort to a list of habits.
 *
 * - Search matches a case-insensitive substring against name or description.
 * - `manual` sort preserves the incoming order (the saved display order).
 * - `name` sorts A→Z, `streak` high→low, `createdDate` newest first.
 *
 * The input array is never mutated.
 *
 * @param habits - Habits already enriched with `streak` and `completedToday`
 * @param criteria - Active filter/sort selections
 * @returns A new filtered and sorted array
 */
export function filterAndSortHabits<T extends FilterableHabit>(
  habits: T[],
  criteria: HabitFilterCriteria
): T[] {
  const query = criteria.searchQuery.trim().toLowerCase()

  const filtered = habits.filter(
    habit =>
      (query === '' || matchesSearch(habit, query)) &&
      matchesCompletionStatus(habit, criteria.completionStatus) &&
      matchesStreakRange(habit, criteria.streakRange)
  )

  switch (criteria.sortBy) {
    case 'name':
      return [...filtered].sort(
        (a, b) => compareByName(a, b) || a.createdDate.localeCompare(b.createdDate)
      )
    case 'streak':
      return [...filtered].sort((a, b) => b.streak - a.streak || compareByName(a, b))
    case 'createdDate':
      return [...filtered].sort(
        (a, b) => b.createdDate.localeCompare(a.createdDate) || compareByName(a, b)
      )
    case 'manual':
    default:
      return filtered
  }
}
