import {
  getDateString,
  getTodayLocalDateString,
  getYesterdayLocalDateString,
  getPreviousDayDateString,
  getJsWeekdayFromDateString,
} from '../date/dateHelpers'

const MAX_STREAK_LOOKBACK_DAYS = 400

function getUniqueDateSet(completionDates: string[]): Set<string> {
  const dates = completionDates
    .map(getDateString)
    .filter((dateStr, index, self) => self.indexOf(dateStr) === index)
  return new Set(dates)
}

function isGoalDay(dateStr: string, goalDays: number[]): boolean {
  return goalDays.includes(getJsWeekdayFromDateString(dateStr))
}

/**
 * Streak is active when the most recent completed goal day is still “alive”:
 * - Today’s goal day can be incomplete (not due until end of day).
 * - Any earlier goal day without a completion breaks the streak.
 */
function isGoalDaysStreakActive(dateSet: Set<string>, goalDays: number[], todayStr: string): boolean {
  let current = todayStr

  for (let i = 0; i < MAX_STREAK_LOOKBACK_DAYS; i++) {
    if (isGoalDay(current, goalDays)) {
      if (current === todayStr) {
        if (dateSet.has(current)) {
          return true
        }
      } else if (dateSet.has(current)) {
        return true
      } else {
        return false
      }
    }
    current = getPreviousDayDateString(current)
  }

  return false
}

function calculateStreakWithGoalDays(
  dateSet: Set<string>,
  goalDays: number[],
  todayStr: string
): number {
  if (!isGoalDaysStreakActive(dateSet, goalDays, todayStr)) {
    return 0
  }

  let streak = 0
  let current = todayStr
  let counting = false

  for (let i = 0; i < MAX_STREAK_LOOKBACK_DAYS; i++) {
    if (isGoalDay(current, goalDays)) {
      if (dateSet.has(current)) {
        streak++
        counting = true
        current = getPreviousDayDateString(current)
      } else if (counting) {
        break
      } else {
        current = getPreviousDayDateString(current)
      }
    } else {
      current = getPreviousDayDateString(current)
    }
  }

  return streak
}

function calculateDailyStreak(dateSet: Set<string>, todayStr: string, yesterdayStr: string): number {
  const hasToday = dateSet.has(todayStr)
  const hasYesterday = dateSet.has(yesterdayStr)

  if (!hasToday && !hasYesterday) {
    return 0
  }

  let streak = 0
  let currentDateStr = hasToday ? todayStr : yesterdayStr

  while (dateSet.has(currentDateStr)) {
    streak++
    currentDateStr = getPreviousDayDateString(currentDateStr)
  }

  return streak
}

/**
 * Calculates the current streak for a habit based on completion dates.
 *
 * Without goalDays: consecutive calendar days from today backward (today or yesterday must be completed).
 * With goalDays: only goal weekdays count; non-goal days are skipped and never break the streak.
 *
 * @param completionDates - Array of ISO 8601 date strings
 * @param goalDays - Optional JS weekdays (0=Sun … 6=Sat) when the habit should be done
 * @returns The current streak count (0 if no streak)
 */
export function calculateStreak(completionDates: string[], goalDays?: number[]): number {
  if (completionDates.length === 0) {
    return 0
  }

  const dateSet = getUniqueDateSet(completionDates)

  if (dateSet.size === 0) {
    return 0
  }

  const todayStr = getTodayLocalDateString()

  if (goalDays !== undefined && goalDays.length > 0) {
    return calculateStreakWithGoalDays(dateSet, goalDays, todayStr)
  }

  const yesterdayStr = getYesterdayLocalDateString()
  return calculateDailyStreak(dateSet, todayStr, yesterdayStr)
}
