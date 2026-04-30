import type { Habit } from '../../types/habit'

export function restoreHabit(habit: Habit): Habit {
  const copy = { ...habit }
  delete copy.archivedAt
  return copy
}
