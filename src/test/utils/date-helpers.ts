/**
 * Creates an ISO 8601 date string for a specific number of days ago.
 * 
 * @param daysAgo - Number of days ago (0 = today, 1 = yesterday, etc.)
 * @param baseDate - Optional base date to calculate from (defaults to now)
 * @returns ISO 8601 date string in format YYYY-MM-DDTHH:mm:ss.sssZ
 */
export function createDateString(daysAgo: number = 0, baseDate: Date = new Date()): string {
  const date = new Date(baseDate)
  date.setDate(date.getDate() - daysAgo)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}T00:00:00.000Z`
}

/**
 * Creates multiple ISO 8601 date strings for different days ago.
 * 
 * @param daysAgo - Array of numbers representing days ago
 * @param baseDate - Optional base date to calculate from (defaults to now)
 * @returns Array of ISO 8601 date strings
 */
export function createDateStrings(daysAgo: number[], baseDate: Date = new Date()): string[] {
  return daysAgo.map(days => createDateString(days, baseDate))
}

