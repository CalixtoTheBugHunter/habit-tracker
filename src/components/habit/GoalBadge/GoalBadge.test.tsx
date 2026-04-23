import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { GoalBadge } from './GoalBadge'
import { renderWithProviders } from '../../../test/utils/render-helpers'

vi.mock('../../../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
  testUtils: {
    resetDB: vi.fn(),
  },
}))

vi.mock('../../../services/migration', () => ({
  runMigrations: vi.fn(),
  migrations: [],
}))

describe('GoalBadge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 2025-01-15 = Wednesday; ISO week Mon 2025-01-13 – Sun 2025-01-19
    // Mon/Wed/Fri = [1,3,5] → 2025-01-13, 2025-01-15, 2025-01-17
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing when no goal days are completed', () => {
    const { container } = renderWithProviders(
      <GoalBadge goalDays={[1, 3, 5]} completionDates={[]} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when only some goal days are completed', () => {
    const { container } = renderWithProviders(
      <GoalBadge
        goalDays={[1, 3, 5]}
        completionDates={['2025-01-13T00:00:00.000Z', '2025-01-15T00:00:00.000Z']}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders badge when all goal days in the current week are completed', () => {
    const dates = [
      '2025-01-13T00:00:00.000Z', // Mon
      '2025-01-15T00:00:00.000Z', // Wed
      '2025-01-17T00:00:00.000Z', // Fri
    ]
    renderWithProviders(<GoalBadge goalDays={[1, 3, 5]} completionDates={dates} />)
    expect(screen.getByText('Goal met!')).toBeInTheDocument()
  })

  it('renders badge for a single-day goal when that day is completed', () => {
    renderWithProviders(
      <GoalBadge goalDays={[3]} completionDates={['2025-01-15T00:00:00.000Z']} />
    )
    expect(screen.getByText('Goal met!')).toBeInTheDocument()
  })

  it('badge has correct aria-label', () => {
    const dates = [
      '2025-01-13T00:00:00.000Z',
      '2025-01-15T00:00:00.000Z',
      '2025-01-17T00:00:00.000Z',
    ]
    renderWithProviders(<GoalBadge goalDays={[1, 3, 5]} completionDates={dates} />)
    expect(screen.getByLabelText(/goal met: 3 of 3 days this week/i)).toBeInTheDocument()
  })

  it('does not count completions from previous week toward goal', () => {
    const dates = [
      '2025-01-06T00:00:00.000Z', // Mon of previous week
      '2025-01-08T00:00:00.000Z', // Wed of previous week
      '2025-01-10T00:00:00.000Z', // Fri of previous week
    ]
    const { container } = renderWithProviders(
      <GoalBadge goalDays={[1, 3, 5]} completionDates={dates} />
    )
    expect(container.firstChild).toBeNull()
  })
})
