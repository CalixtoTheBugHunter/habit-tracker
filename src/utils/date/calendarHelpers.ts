/**
 * Gets the number of days in a specific month.
 * 
 * @param year - The year (e.g., 2025)
 * @param month - The month (1-12, where 1 = January)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/**
 * Gets the day of the week for the first day of a month.
 * 
 * @param year - The year (e.g., 2025)
 * @param month - The month (1-12, where 1 = January)
 * @returns Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
}

/**
 * Gets a calendar grid for a specific month.
 * Returns an array of weeks, where each week is an array of 7 Date objects.
 * Includes days from previous and next months to fill complete weeks.
 * Always returns 6 weeks for consistent display.
 * 
 * @param year - The year (e.g., 2025)
 * @param month - The month (1-12, where 1 = January)
 * @returns Array of weeks, each containing 7 Date objects
 */
export function getCalendarGrid(year: number, month: number): Date[][] {
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  
  const grid: Date[][] = []
  let currentDate = new Date(Date.UTC(year, month - 1, 1))
  
  // Go back to the first day of the week (Sunday)
  currentDate.setUTCDate(currentDate.getUTCDate() - firstDay)
  
  // Always show 6 weeks for consistency (42 days)
  const totalDays = 42
  
  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    const week: Date[] = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      week.push(new Date(currentDate))
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    grid.push(week)
  }
  
  return grid
}

/**
 * Checks if a date string falls within a specific month and year.
 * 
 * @param dateStr - ISO 8601 date string
 * @param year - The year to check against
 * @param month - The month to check against (1-12, where 1 = January)
 * @returns true if the date is in the specified month and year
 */
export function isDateInMonth(dateStr: string, year: number, month: number): boolean {
  const datePart = dateStr.split('T')[0]
  const [dateYear, dateMonth] = datePart.split('-').map(Number)
  return dateYear === year && dateMonth === month
}

/**
 * Formats a month and year for display.
 * 
 * @param year - The year (e.g., 2025)
 * @param month - The month (1-12, where 1 = January)
 * @returns Formatted string like "January 2025"
 */
export function formatMonthYear(year: number, month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${monthNames[month - 1]} ${year}`
}

