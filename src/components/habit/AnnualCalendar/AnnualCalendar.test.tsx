import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { AnnualCalendar } from './AnnualCalendar'
import { createMockHabit } from '../../../test/fixtures/habits'
import { createDateString } from '../../../test/utils/date-helpers'

describe('AnnualCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-11-19T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render calendar grid for current year', () => {
    const habit = createMockHabit({
      id: '1',
      name: 'Exercise',
      completionDates: [],
    })

    const { container } = render(<AnnualCalendar habit={habit} />)

    // Should have 7 day rows (one for each day of week)
    const dayRows = container.querySelectorAll('.annual-calendar-day-row')
    expect(dayRows.length).toBe(7)
    
    // Each row should have 53 weeks (columns)
    const firstRow = dayRows[0]
    const days = firstRow?.querySelectorAll('.annual-calendar-day')
    expect(days?.length).toBe(53)
  })

  it('should highlight completed dates', () => {
    const todayStr = createDateString(0)
    const yesterdayStr = createDateString(1)
    const weekAgoStr = createDateString(7)

    const habit = createMockHabit({
      id: '1',
      name: 'Exercise',
      completionDates: [todayStr, yesterdayStr, weekAgoStr],
    })

    const { container } = render(<AnnualCalendar habit={habit} />)

    // Find completed date cells
    const completedCells = container.querySelectorAll('.annual-calendar-day.completed')
    expect(completedCells.length).toBeGreaterThanOrEqual(3)
  })

  it('should handle empty completion dates', () => {
    const habit = createMockHabit({
      id: '1',
      completionDates: [],
    })

    const { container } = render(<AnnualCalendar habit={habit} />)

    // Should render without errors
    const calendar = container.querySelector('.annual-calendar')
    expect(calendar).toBeInTheDocument()
  })

  describe('Visual requirements', () => {
    it('should apply completed class to completed dates', () => {
      const todayStr = createDateString(0)
      const habit = createMockHabit({
        id: '1',
        completionDates: [todayStr],
      })

      const { container } = render(<AnnualCalendar habit={habit} />)
      const completedCells = container.querySelectorAll('.annual-calendar-day.completed')
      
      expect(completedCells.length).toBeGreaterThan(0)
      completedCells.forEach(cell => {
        expect(cell).toHaveClass('completed')
      })
    })

    it('should apply today class to today\'s date', () => {
      const habit = createMockHabit({
        id: '1',
        completionDates: [],
      })

      const { container } = render(<AnnualCalendar habit={habit} />)
      const todayCells = container.querySelectorAll('.annual-calendar-day.today')
      
      expect(todayCells.length).toBe(1)
      expect(todayCells[0]).toHaveClass('today')
      expect(todayCells[0]).toHaveAttribute('aria-current', 'date')
    })

    it('should apply both completed and today classes when today is completed', () => {
      const todayStr = createDateString(0)
      const habit = createMockHabit({
        id: '1',
        completionDates: [todayStr],
      })

      const { container } = render(<AnnualCalendar habit={habit} />)
      const todayCompletedCell = container.querySelector('.annual-calendar-day.today.completed')
      
      expect(todayCompletedCell).toBeInTheDocument()
      expect(todayCompletedCell).toHaveClass('today')
      expect(todayCompletedCell).toHaveClass('completed')
    })

    it('should have correct grid structure with 7 rows and 53 columns', () => {
      const habit = createMockHabit({
        id: '1',
        completionDates: [],
      })

      const { container } = render(<AnnualCalendar habit={habit} />)
      const dayRows = container.querySelectorAll('.annual-calendar-day-row')
      
      expect(dayRows.length).toBe(7)
      
      dayRows.forEach(row => {
        const days = row.querySelectorAll('.annual-calendar-day')
        expect(days.length).toBe(53)
      })
    })

    it('should have proper ARIA attributes for accessibility', () => {
      const habit = createMockHabit({
        id: '1',
        completionDates: [],
      })

      const { container } = render(<AnnualCalendar habit={habit} />)
      const grid = container.querySelector('[role="grid"]')
      const rows = container.querySelectorAll('[role="row"]')
      const cells = container.querySelectorAll('[role="gridcell"]')
      
      expect(grid).toBeInTheDocument()
      expect(rows.length).toBe(7)
      expect(cells.length).toBe(7 * 53)
      
      cells.forEach(cell => {
        expect(cell).toHaveAttribute('aria-label')
        expect(cell).toHaveAttribute('title')
      })
    })

    it('should mark other-year dates with other-year class', () => {
      const habit = createMockHabit({
        id: '1',
        completionDates: [],
      })

      const { container } = render(<AnnualCalendar habit={habit} />)
      const otherYearCells = container.querySelectorAll('.annual-calendar-day.other-year')
      
      // Should have some other-year cells (days from previous/next year)
      expect(otherYearCells.length).toBeGreaterThan(0)
    })

    it('should have all days with title attribute for tooltips', () => {
      const habit = createMockHabit({
        id: '1',
        completionDates: [],
      })

      const { container } = render(<AnnualCalendar habit={habit} />)
      const allDays = container.querySelectorAll('.annual-calendar-day')
      
      allDays.forEach(day => {
        expect(day).toHaveAttribute('title')
        const title = day.getAttribute('title')
        expect(title).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('should have consistent square structure and classes', () => {
      const habit = createMockHabit({
        id: '1',
        completionDates: [],
      })

      const { container } = render(<AnnualCalendar habit={habit} />)
      const allDays = container.querySelectorAll('.annual-calendar-day')
      
      expect(allDays.length).toBe(7 * 53)
      
      // All days should have the base class
      allDays.forEach(day => {
        expect(day).toHaveClass('annual-calendar-day')
        expect(day).toHaveAttribute('role', 'gridcell')
        expect(day).toHaveAttribute('aria-label')
        expect(day).toHaveAttribute('title')
      })
    })
  })
})

