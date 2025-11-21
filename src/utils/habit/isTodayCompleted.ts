import { getTodayUTCDateString } from '../date/dateHelpers'

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

