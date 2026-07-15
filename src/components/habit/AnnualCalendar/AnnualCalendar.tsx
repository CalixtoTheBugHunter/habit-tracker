import { useMemo } from 'react'
import { formatMessage } from '../../../locale'
import { useLanguage } from '../../../contexts/LanguageContext'
import { getYearGrid, getDateString, isDateCompleted, isMissedGoalDay } from '../../../utils/date/annualCalendarHelpers'
import { getTodayLocalDateString } from '../../../utils/date/dateHelpers'
import type { Habit } from '../../../types/habit'
import './AnnualCalendar.css'

interface AnnualCalendarProps {
  habit: Habit
}

export function AnnualCalendar({ habit }: AnnualCalendarProps) {
  const { messages } = useLanguage()
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

  const calendarAriaLabel = formatMessage(messages.annualCalendar.ariaLabel, {
    name: habit.name || messages.annualCalendar.nameFallback,
  })
  return (
    <div className="annual-calendar" aria-label={calendarAriaLabel}>
      <div className="annual-calendar-grid" role="grid">
        {transposedGrid.map((dayRow, dayIndex) => (
          <div key={dayIndex} className="annual-calendar-day-row" role="row">
            {dayRow.map((date, weekIndex) => {
              const dateStr = getDateString(date)
              const completed = isCompleted(date)
              const isTodayDate = isToday(date)
              const isCurrentYear = date.getFullYear() === currentYear
              const missed = isMissedGoalDay(
                date,
                dateStr,
                today,
                habit.createdDate,
                completed,
                habit.goalDays
              )

              const cellAriaLabel = isTodayDate
                ? formatMessage(messages.annualCalendar.today, { date: dateStr })
                : missed
                  ? formatMessage(messages.annualCalendar.missed, { date: dateStr })
                  : completed
                    ? formatMessage(messages.annualCalendar.completed, { date: dateStr })
                    : formatMessage(messages.annualCalendar.date, { date: dateStr })

              return (
                <div
                  key={weekIndex}
                  className={`annual-calendar-day ${completed ? 'completed' : ''} ${missed ? 'missed' : ''} ${isTodayDate ? 'today' : ''} ${!isCurrentYear ? 'other-year' : ''}`}
                  role="gridcell"
                  aria-label={cellAriaLabel}
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

