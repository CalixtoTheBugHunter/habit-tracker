/**
 * Validates if a string is a valid ISO 8601 date string.
 * 
 * ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
 * Examples of valid formats:
 * - 2025-01-01T00:00:00.000Z
 * - 2025-12-31T23:59:59.999Z
 * 
 * @param dateString - The string to validate
 * @returns true if the string is a valid ISO 8601 date string, false otherwise
 */
export function isValidISO8601(dateString: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
  if (!iso8601Regex.test(dateString)) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime()) && date.toISOString() === dateString
}

