import { getTodayLocalDateString } from '../date/dateHelpers'
import { getDateString } from '../date/dateHelpers'
import type { Habit } from '../../types/habit'

/**
 * Toggles completion for today for a stacking-only habit (stored in parent's stackingCompletions).
 * Returns a new habit; does not mutate the input.
 */
export function toggleStackingHabitCompletion(
  parentHabit: Habit,
  stackingHabitId: string
): Habit {
  const todayStr = getTodayLocalDateString()
  const todayISO = `${todayStr}T00:00:00.000Z`
  const current = parentHabit.stackingCompletions?.[stackingHabitId] ?? []
  const isCompleted = current.some(dateStr => getDateString(dateStr) === todayStr)

  const nextCompletions = { ...(parentHabit.stackingCompletions ?? {}) }
  if (isCompleted) {
    nextCompletions[stackingHabitId] = current.filter(
      dateStr => getDateString(dateStr) !== todayStr
    )
    if (nextCompletions[stackingHabitId].length === 0) {
      delete nextCompletions[stackingHabitId]
    }
  } else {
    nextCompletions[stackingHabitId] = [...current, todayISO]
  }

  return {
    ...parentHabit,
    stackingCompletions: Object.keys(nextCompletions).length > 0 ? nextCompletions : undefined,
  }
}
