import { getTodayLocalDateString, getDateString } from '../date/dateHelpers'
import { isTodayCompleted } from './isTodayCompleted'
import { isStackingHabitCompletedToday } from './isStackingHabitCompletedToday'
import type { Habit } from '../../types/habit'

/**
 * Returns true if every stacking step is completed for today, using the same
 * rules as HabitStackingAccordion (resolved habit vs stacking-only on parent).
 */
export function areAllStackedHabitsCompletedForToday(
  parentHabit: Habit,
  stackingHabitsResolved: (Habit | undefined)[]
): boolean {
  const ids = parentHabit.stackingHabits
  if (!ids?.length) {
    return false
  }

  for (let i = 0; i < ids.length; i++) {
    const stackingHabitId = ids[i]!
    const resolved = stackingHabitsResolved[i]
    const stepDone =
      resolved === undefined
        ? isStackingHabitCompletedToday(parentHabit.stackingCompletions, stackingHabitId)
        : isTodayCompleted(resolved.completionDates)
    if (!stepDone) {
      return false
    }
  }

  return true
}

/** True if autoCompletedDates records today (calendar day, local). */
export function hasAutoCompletedForToday(habit: Habit): boolean {
  const dates = habit.autoCompletedDates
  if (!dates?.length) {
    return false
  }
  const todayStr = getTodayLocalDateString()
  return dates.some(d => getDateString(d) === todayStr)
}

/**
 * Adds or removes main habit completion for today based on whether all stacked
 * steps are done. Returns the same parent reference when nothing changes.
 */
export function syncParentMainCompletionWithStackingState(
  parentHabit: Habit,
  stackingHabitsResolved: (Habit | undefined)[]
): Habit {
  if (!parentHabit.stackingHabits?.length) {
    return parentHabit
  }

  const todayStr = getTodayLocalDateString()
  const todayISO = `${todayStr}T00:00:00.000Z`
  const allDone = areAllStackedHabitsCompletedForToday(parentHabit, stackingHabitsResolved)

  if (allDone) {
    if (isTodayCompleted(parentHabit.completionDates)) {
      return parentHabit
    }
    const nextAuto = [...(parentHabit.autoCompletedDates ?? [])]
    if (!nextAuto.some(d => getDateString(d) === todayStr)) {
      nextAuto.push(todayISO)
    }
    return {
      ...parentHabit,
      completionDates: [...parentHabit.completionDates, todayISO],
      autoCompletedDates: nextAuto.length > 0 ? nextAuto : undefined,
    }
  }

  if (isTodayCompleted(parentHabit.completionDates) && hasAutoCompletedForToday(parentHabit)) {
    const nextCompletionDates = parentHabit.completionDates.filter(
      dateStr => getDateString(dateStr) !== todayStr
    )
    const nextAuto =
      parentHabit.autoCompletedDates?.filter(dateStr => getDateString(dateStr) !== todayStr) ?? []
    return {
      ...parentHabit,
      completionDates: nextCompletionDates,
      autoCompletedDates: nextAuto.length > 0 ? nextAuto : undefined,
    }
  }

  return parentHabit
}

/** Removes today's calendar entries from autoCompletedDates. */
export function stripTodayFromAutoCompletedDates(habit: Habit): Habit {
  const dates = habit.autoCompletedDates
  if (!dates?.length) {
    return habit
  }
  const todayStr = getTodayLocalDateString()
  const next = dates.filter(d => getDateString(d) !== todayStr)
  if (next.length === dates.length) {
    return habit
  }
  return {
    ...habit,
    autoCompletedDates: next.length > 0 ? next : undefined,
  }
}
