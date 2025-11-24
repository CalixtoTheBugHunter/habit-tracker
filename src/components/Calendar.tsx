import { useState, useMemo } from 'react'
import { useHabits } from '../contexts/HabitContext'
import { getCalendarGrid, isDateInMonth, formatMonthYear } from '../utils/date/calendarHelpers'
import { getTodayUTCDateString, getUTCDateString } from '../utils/date/dateHelpers'
import './Calendar.css'

export function Calendar() {
  const { habits, isLoading, error } = useHabits()
  const today = getTodayUTCDateString()
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
    }
  })

  const calendarGrid = useMemo(() => {
    return getCalendarGrid(currentDate.year, currentDate.month)
  }, [currentDate.year, currentDate.month])

  const completedDatesSet = useMemo(() => {
    const set = new Set<string>()
    habits.forEach(habit => {
      habit.completionDates.forEach(dateStr => {
        const datePart = getUTCDateString(dateStr)
        if (isDateInMonth(dateStr, currentDate.year, currentDate.month)) {
          set.add(datePart)
        }
      })
    })
    return set
  }, [habits, currentDate.year, currentDate.month])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      let newMonth = prev.month + (direction === 'next' ? 1 : -1)
      let newYear = prev.year

      if (newMonth < 1) {
        newMonth = 12
        newYear--
      } else if (newMonth > 12) {
        newMonth = 1
        newYear++
      }

      return { year: newYear, month: newMonth }
    })
  }

  const isToday = (date: Date): boolean => {
    const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
    return dateStr === today
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getUTCFullYear() === currentDate.year && date.getUTCMonth() + 1 === currentDate.month
  }

  const getDateString = (date: Date): string => {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="calendar" role="status" aria-live="polite" aria-atomic="true">
        <p>Loading calendar...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="calendar" role="alert" aria-live="assertive" aria-atomic="true">
        <p className="error">Error loading calendar: {error}</p>
      </div>
    )
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav-button"
          onClick={() => navigateMonth('prev')}
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="calendar-month-year">{formatMonthYear(currentDate.year, currentDate.month)}</h2>
        <button
          type="button"
          className="calendar-nav-button"
          onClick={() => navigateMonth('next')}
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className="calendar-grid" role="grid" aria-label={`Calendar for ${formatMonthYear(currentDate.year, currentDate.month)}`}>
        <div className="calendar-weekdays" role="row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-weekday" role="columnheader">
              {day}
            </div>
          ))}
        </div>
        {calendarGrid.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week" role="row">
            {week.map((date, dayIndex) => {
              const dateStr = getDateString(date)
              const completed = completedDatesSet.has(dateStr)
              const today = isToday(date)
              const currentMonth = isCurrentMonth(date)

              return (
                <div
                  key={dayIndex}
                  className={`calendar-day ${completed ? 'completed' : ''} ${today ? 'today' : ''} ${!currentMonth ? 'other-month' : ''}`}
                  role="gridcell"
                  aria-label={today ? `Today, ${dateStr}` : dateStr}
                  {...(today && { 'aria-current': 'date' })}
                >
                  <span className="calendar-day-number">{date.getUTCDate()}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

