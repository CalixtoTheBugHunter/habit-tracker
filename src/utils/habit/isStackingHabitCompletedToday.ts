import { getTodayLocalDateString } from '../date/dateHelpers'

/**
 * Returns whether a stacking habit is marked completed for today according to
 * the parent habit's stackingCompletions.
 */
export function isStackingHabitCompletedToday(
  stackingCompletions: Record<string, string[]> | undefined,
  stackingHabitId: string
): boolean {
  if (!stackingCompletions || !stackingCompletions[stackingHabitId]?.length) {
    return false
  }
  const todayStr = getTodayLocalDateString()
  const dates = stackingCompletions[stackingHabitId]
  return dates.some(dateStr => {
    const datePart = dateStr.split('T')[0]
    return datePart === todayStr
  })
}
