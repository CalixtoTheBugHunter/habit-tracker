import type { Habit } from '../../types/habit'

/** Next sortOrder for a new active habit (append after current active habits). */
export function nextSortOrderForNewHabit(habits: Habit[]): number {
  let max = -1
  for (const h of habits) {
    if (h.archivedAt) continue
    if (h.sortOrder !== undefined && h.sortOrder > max) {
      max = h.sortOrder
    }
  }
  return max + 1
}
