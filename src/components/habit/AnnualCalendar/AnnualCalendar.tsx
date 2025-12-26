import { useMemo } from 'react'
import { getYearGrid, getDateString, isDateCompleted } from '../../../utils/date/annualCalendarHelpers'
import { getTodayLocalDateString } from '../../../utils/date/dateHelpers'
import type { Habit } from '../../../types/habit'
import './AnnualCalendar.css'

interface AnnualCalendarProps {
  habit: Habit
}

export function AnnualCalendar({ habit }: AnnualCalendarProps) {
  const currentYear = new Date().getFullYear()
  const today = getTodayLocalDateString()

  const yearGrid = useMemo(() => {
    return getYearGrid(currentYear)
  }, [currentYear])

  // Transpose the grid: convert weeks (rows) to days (rows) and days (columns) to weeks (columns)
  const transposedGrid = useMemo(() => {
    const days: Date[][] = []
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayRow: Date[] = []
      for (let weekIndex = 0; weekIndex < yearGrid.length; weekIndex++) {
        const week = yearGrid[weekIndex]
        const date = week?.[dayIndex]
        if (date) {
          dayRow.push(date)
        }
      }
      days.push(dayRow)
    }
    return days
  }, [yearGrid])

  const isToday = (date: Date): boolean => {
    return getDateString(date) === today
  }

  const isCompleted = (date: Date): boolean => {
    const dateStr = getDateString(date)
    return isDateCompleted(dateStr, habit.completionDates)
  }

  return (
    <div className="annual-calendar" aria-label={`Annual completion calendar for ${habit.name || 'habit'}`}>
      <div className="annual-calendar-grid" role="grid">
        {transposedGrid.map((dayRow, dayIndex) => (
          <div key={dayIndex} className="annual-calendar-day-row" role="row">
            {dayRow.map((date, weekIndex) => {
              const dateStr = getDateString(date)
              const completed = isCompleted(date)
              const isTodayDate = isToday(date)
              const isCurrentYear = date.getFullYear() === currentYear

              return (
                <div
                  key={weekIndex}
                  className={`annual-calendar-day ${completed ? 'completed' : ''} ${isTodayDate ? 'today' : ''} ${!isCurrentYear ? 'other-year' : ''}`}
                  role="gridcell"
                  aria-label={isTodayDate ? `Today, ${dateStr}` : dateStr}
                  title={dateStr}
                  {...(isTodayDate && { 'aria-current': 'date' })}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

