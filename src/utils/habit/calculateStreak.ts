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

function getNextDayDateString(dateStr: string): string {
  const parts = dateStr.split('-')
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1))
  const nextYear = nextDay.getUTCFullYear()
  const nextMonth = String(nextDay.getUTCMonth() + 1).padStart(2, '0')
  const nextDayStr = String(nextDay.getUTCDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDayStr}`
}

/**
 * True when every goal day from anchor through today is completed, except today
 * (still in progress). Non-goal days are ignored.
 */
function isGoalDayChainIntactFromAnchor(
  dateSet: Set<string>,
  goalDays: number[],
  anchor: string,
  todayStr: string
): boolean {
  let current = getNextDayDateString(anchor)

  while (current <= todayStr) {
    if (isGoalDay(current, goalDays)) {
      const todayGrace = current === todayStr && !dateSet.has(current)
      if (!dateSet.has(current) && !todayGrace) {
        return false
      }
    }
    current = getNextDayDateString(current)
  }

  return true
}

/**
 * Streak is active when the most recent completed goal day still connects to today:
 * - Today’s goal day can be incomplete (not due until end of day).
 * - Any other goal day on or after that anchor without a completion breaks the streak.
 */
function isGoalDaysStreakActive(dateSet: Set<string>, goalDays: number[], todayStr: string): boolean {
  let current = todayStr

  for (let i = 0; i < MAX_STREAK_LOOKBACK_DAYS; i++) {
    if (isGoalDay(current, goalDays) && dateSet.has(current)) {
      if (current === todayStr) {
        return true
      }
      return isGoalDayChainIntactFromAnchor(dateSet, goalDays, current, todayStr)
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
