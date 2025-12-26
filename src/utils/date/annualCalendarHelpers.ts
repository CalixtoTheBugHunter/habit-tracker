/**
 * Formats a Date object as YYYY-MM-DD string.
 * 
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format based on local timezone
 */
export function getDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Gets the Sunday (start of week) for a given date.
 * 
 * @param date - Date object
 * @returns Date object representing the Sunday of that week based on local timezone
 */
export function getWeekStartDate(date: Date): Date {
  const sunday = new Date(date)
  const dayOfWeek = sunday.getDay()
  sunday.setDate(sunday.getDate() - dayOfWeek)
  return sunday
}

/**
 * Gets a grid representing all weeks in a year.
 * Each week starts on Sunday and contains 7 days.
 * Returns 53 weeks to ensure the entire year is covered.
 * 
 * @param year - The year (e.g., 2025)
 * @returns Array of weeks, each containing 7 Date objects based on local timezone
 */
export function getYearGrid(year: number): Date[][] {
  const grid: Date[][] = []
  
  // Start from January 1st of the year
  const jan1 = new Date(year, 0, 1)
  const firstSunday = getWeekStartDate(jan1)
  
  // Generate 53 weeks (some years need 53 weeks)
  let currentDate = new Date(firstSunday)
  
  for (let week = 0; week < 53; week++) {
    const weekDays: Date[] = []
    for (let day = 0; day < 7; day++) {
      weekDays.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    grid.push(weekDays)
  }
  
  return grid
}

/**
 * Checks if a date string (YYYY-MM-DD) is in the completion dates array.
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param completionDates - Array of ISO 8601 date strings
 * @returns true if the date is completed
 */
export function isDateCompleted(dateStr: string, completionDates: string[]): boolean {
  return completionDates.some(completionDate => {
    const completionDateStr = completionDate.split('T')[0]
    return completionDateStr === dateStr
  })
}
