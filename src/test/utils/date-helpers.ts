/**
 * Creates an ISO 8601 date string for a specific number of days ago.
 * 
 * @param daysAgo - Number of days ago (0 = today, 1 = yesterday, etc.)
 * @param baseDate - Optional base date to calculate from (defaults to now)
 * @returns ISO 8601 date string in format YYYY-MM-DDTHH:mm:ss.sssZ
 */
export function createDateString(daysAgo: number = 0, baseDate: Date = new Date()): string {
  const date = new Date(baseDate)
  date.setUTCDate(date.getUTCDate() - daysAgo)
  const dateStr = date.toISOString().split('T')[0]
  return `${dateStr}T00:00:00.000Z`
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

