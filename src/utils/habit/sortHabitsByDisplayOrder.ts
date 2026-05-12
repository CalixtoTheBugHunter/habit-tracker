import type { Habit } from '../../types/habit'

/** Lower sortOrder first; missing sortOrder sorts after defined values. Tie-break: createdDate, id. */
export function compareHabitsDisplayOrder(a: Habit, b: Habit): number {
  const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER
  const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER
  if (orderA !== orderB) return orderA - orderB
  const byDate = a.createdDate.localeCompare(b.createdDate)
  if (byDate !== 0) return byDate
  return a.id.localeCompare(b.id)
}

export function sortHabitsByDisplayOrder(habits: Habit[]): Habit[] {
  return [...habits].sort(compareHabitsDisplayOrder)
}
