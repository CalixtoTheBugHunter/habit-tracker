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
 * Checks if a habit is completed for today.
 * 
 * @param completionDates - Array of ISO 8601 date strings
 * @returns true if today is in the completion dates, false otherwise
 */
export function isTodayCompleted(completionDates: string[]): boolean {
  if (completionDates.length === 0) {
    return false
  }

  const todayStr = getTodayUTCDateString()

  return completionDates.some(dateStr => {
    const dateOnlyStr = dateStr.split('T')[0]
    return dateOnlyStr === todayStr
  })
}

