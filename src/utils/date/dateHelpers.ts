/**
 * Gets the date string (YYYY-MM-DD) from an ISO 8601 date string.
 * 
 * @param dateStr - ISO 8601 date string
 * @returns Date string in YYYY-MM-DD format
 * @throws Error if the date string is invalid
 */
export function getDateString(dateStr: string): string {
  const datePart = dateStr.split('T')[0]
  if (!datePart || !datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }
  return datePart
}

/**
 * Gets today's local date string (YYYY-MM-DD).
 * 
 * @returns Today's date in YYYY-MM-DD format based on local timezone
 */
export function getTodayLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Gets yesterday's local date string (YYYY-MM-DD).
 * 
 * @returns Yesterday's date in YYYY-MM-DD format based on local timezone
 */
export function getYesterdayLocalDateString(): string {
  const now = new Date()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  const year = yesterday.getFullYear()
  const month = String(yesterday.getMonth() + 1).padStart(2, '0')
  const day = String(yesterday.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Gets the previous day's UTC date string from a given date string.
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Previous day's date in YYYY-MM-DD format
 * @throws Error if the date string format is invalid
 */
export function getPreviousDayUTCDateString(dateStr: string): string {
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
  // Validate that the date is actually valid (not normalized by Date constructor)
  const testDate = new Date(Date.UTC(year, month - 1, day))
  if (
    testDate.getUTCFullYear() !== year ||
    testDate.getUTCMonth() !== month - 1 ||
    testDate.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }
  const previousDay = new Date(Date.UTC(year, month - 1, day - 1))
  const prevYear = previousDay.getUTCFullYear()
  const prevMonth = String(previousDay.getUTCMonth() + 1).padStart(2, '0')
  const prevDay = String(previousDay.getUTCDate()).padStart(2, '0')
  return `${prevYear}-${prevMonth}-${prevDay}`
}

