import {
  getDateString,
  getTodayLocalDateString,
  getPreviousDayDateString,
} from '../date/dateHelpers'

function getUniqueSortedDates(completionDates: string[]): string[] {
  return completionDates
    .map(getDateString)
    .filter((dateStr, index, self) => self.indexOf(dateStr) === index)
    .sort()
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

export function calculateLongestStreak(completionDates: string[]): number {
  const dates = getUniqueSortedDates(completionDates)
  if (dates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1]!
    const expectedNext = getNextDayDateString(prev)
    if (dates[i] === expectedNext) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }

  return longest
}

export function calculateCompletionRate(completionDates: string[], createdDate: string): number {
  const totalDays = calculateTotalDaysTracked(createdDate)
  if (totalDays === 0) return 0

  const uniqueDates = getUniqueSortedDates(completionDates)
  const rate = (uniqueDates.length / totalDays) * 100
  return Math.min(Math.round(rate), 100)
}

export function calculateTotalDaysTracked(createdDate: string): number {
  const created = getDateString(createdDate)
  const today = getTodayLocalDateString()

  if (created > today) return 0

  const createdParts = created.split('-')
  const todayParts = today.split('-')
  const createdMs = Date.UTC(Number(createdParts[0]), Number(createdParts[1]) - 1, Number(createdParts[2]))
  const todayMs = Date.UTC(Number(todayParts[0]), Number(todayParts[1]) - 1, Number(todayParts[2]))
  return Math.floor((todayMs - createdMs) / 86_400_000) + 1
}

export function calculateWeeklyCompletionRate(completionDates: string[]): number {
  const today = getTodayLocalDateString()
  let dateStr = today
  const last7Days: string[] = [dateStr]
  for (let i = 0; i < 6; i++) {
    dateStr = getPreviousDayDateString(dateStr)
    last7Days.push(dateStr)
  }

  const uniqueDates = getUniqueSortedDates(completionDates)
  const count = last7Days.filter(d => uniqueDates.includes(d)).length
  return Math.round((count / 7) * 100)
}

export function calculateMonthlyCompletionRate(completionDates: string[]): number {
  const today = getTodayLocalDateString()
  let dateStr = today
  const last30Days: string[] = [dateStr]
  for (let i = 0; i < 29; i++) {
    dateStr = getPreviousDayDateString(dateStr)
    last30Days.push(dateStr)
  }

  const uniqueDates = getUniqueSortedDates(completionDates)
  const count = last30Days.filter(d => uniqueDates.includes(d)).length
  return Math.round((count / 30) * 100)
}
