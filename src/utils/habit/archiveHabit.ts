import type { Habit } from '../../types/habit'

export function archiveHabit(habit: Habit, now: Date = new Date()): Habit {
  return { ...habit, archivedAt: now.toISOString() }
}
