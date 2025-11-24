import { useMemo, useRef, useEffect } from 'react'
import { getYearGrid, getDateString, isDateCompleted } from '../utils/date/annualCalendarHelpers'
import { getTodayUTCDateString } from '../utils/date/dateHelpers'
import type { Habit } from '../types/habit'
import './AnnualCalendar.css'

interface AnnualCalendarProps {
  habit: Habit
}

export function AnnualCalendar({ habit }: AnnualCalendarProps) {
  const currentYear = new Date().getUTCFullYear()
  const today = getTodayUTCDateString()

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

  const todayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const SMALL_SCREEN_BREAKPOINT = 900

  // Scroll to today on small screens
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const scrollToToday = () => {
      if (todayRef.current && containerRef.current) {
        const isSmallScreen = window.innerWidth <= SMALL_SCREEN_BREAKPOINT
        if (isSmallScreen) {
          // Clear any existing timer
          if (timer) {
            clearTimeout(timer)
          }
          // Small delay to ensure layout is complete
          timer = setTimeout(() => {
            if (todayRef.current && containerRef.current) {
              todayRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
              })
            }
            timer = null
          }, 100)
        }
      }
    }

    // Initial scroll
    scrollToToday()

    // Handle window resize
    const handleResize = () => {
      scrollToToday()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [habit.id])

  return (
    <div className="annual-calendar" aria-label={`Annual completion calendar for ${habit.name || 'habit'}`} ref={containerRef}>
      <div className="annual-calendar-grid" role="grid">
        {transposedGrid.map((dayRow, dayIndex) => (
          <div key={dayIndex} className="annual-calendar-day-row" role="row">
            {dayRow.map((date, weekIndex) => {
              const dateStr = getDateString(date)
              const completed = isCompleted(date)
              const isTodayDate = isToday(date)
              const isCurrentYear = date.getUTCFullYear() === currentYear

              return (
                <div
                  key={weekIndex}
                  ref={isTodayDate ? todayRef : null}
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

