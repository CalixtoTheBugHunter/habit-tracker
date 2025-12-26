import {
  getDateString,
  getTodayLocalDateString,
  getYesterdayLocalDateString,
  getPreviousDayUTCDateString,
} from '../date/dateHelpers'

/**
 * Calculates the current streak for a habit based on completion dates.
 * 
 * A streak is the number of consecutive days from today backwards.
 * The streak includes today if it's completed, otherwise it starts from yesterday.
 * 
 * @param completionDates - Array of ISO 8601 date strings
 * @returns The current streak count (0 if no streak)
 */
export function calculateStreak(completionDates: string[]): number {
  if (completionDates.length === 0) {
    return 0
  }

  const dateOnlyStrings = completionDates
    .map(getDateString)
    .filter((dateStr, index, self) => self.indexOf(dateStr) === index)
    .sort()
    .reverse()

  if (dateOnlyStrings.length === 0) {
    return 0
  }

  const todayStr = getTodayLocalDateString()
  const yesterdayStr = getYesterdayLocalDateString()

  const hasToday = dateOnlyStrings.includes(todayStr)
  const hasYesterday = dateOnlyStrings.includes(yesterdayStr)

  if (!hasToday && !hasYesterday) {
    return 0
  }

  let streak = 0
  let currentDateStr = hasToday ? todayStr : yesterdayStr

  while (dateOnlyStrings.includes(currentDateStr)) {
    streak++
    currentDateStr = getPreviousDayUTCDateString(currentDateStr)
  }

  return streak
}

