/**
 * Gets the UTC date string (YYYY-MM-DD) from an ISO 8601 date string.
 */
function getUTCDateString(dateStr: string): string {
  const datePart = dateStr.split('T')[0]
  if (!datePart) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }
  return datePart
}

/**
 * Gets today's UTC date string (YYYY-MM-DD).
 */
function getTodayUTCDateString(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Gets yesterday's UTC date string (YYYY-MM-DD).
 */
function getYesterdayUTCDateString(): string {
  const now = new Date()
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1))
  const year = yesterday.getUTCFullYear()
  const month = String(yesterday.getUTCMonth() + 1).padStart(2, '0')
  const day = String(yesterday.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Gets the previous day's UTC date string from a given date string.
 */
function getPreviousDayUTCDateString(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) {
    throw new Error(`Invalid date string format: ${dateStr}`)
  }
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }
  const previousDay = new Date(Date.UTC(year, month - 1, day - 1))
  const prevYear = previousDay.getUTCFullYear()
  const prevMonth = String(previousDay.getUTCMonth() + 1).padStart(2, '0')
  const prevDay = String(previousDay.getUTCDate()).padStart(2, '0')
  return `${prevYear}-${prevMonth}-${prevDay}`
}

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
    .map(getUTCDateString)
    .filter((dateStr, index, self) => self.indexOf(dateStr) === index)
    .sort()
    .reverse()

  if (dateOnlyStrings.length === 0) {
    return 0
  }

  const todayStr = getTodayUTCDateString()
  const yesterdayStr = getYesterdayUTCDateString()

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

