import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { HabitList } from './HabitList'
import { renderWithProviders } from '../test/utils/render-helpers'
import { createMockHabit } from '../test/fixtures/habits'
import { getAllHabits, openDB } from '../services/indexedDB'

vi.mock('../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  testUtils: {
    resetDB: vi.fn(),
  },
}))

describe('HabitList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
  })

  it('should render empty state when no habits exist', async () => {
    vi.mocked(getAllHabits).mockResolvedValue([])

    renderWithProviders(<HabitList />)

    expect(await screen.findByText(/no habits yet/i)).toBeInTheDocument()
  })

  it('should render list of habits with name, description, and streak', async () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] + 'T00:00:00.000Z'
    const yesterday = new Date(today)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0] + 'T00:00:00.000Z'

    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        description: 'Daily workout',
        completionDates: [todayStr, yesterdayStr],
      }),
      createMockHabit({
        id: '2',
        name: 'Read',
        description: 'Read for 30 minutes',
        completionDates: [todayStr],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    expect(await screen.findByText('Exercise')).toBeInTheDocument()
    expect(await screen.findByText('Daily workout')).toBeInTheDocument()
    expect(await screen.findByText('Read')).toBeInTheDocument()
    expect(await screen.findByText('Read for 30 minutes')).toBeInTheDocument()
  })

  it('should display streak count for each habit', async () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] + 'T00:00:00.000Z'
    const yesterday = new Date(today)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0] + 'T00:00:00.000Z'
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2)
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0] + 'T00:00:00.000Z'

    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [todayStr, yesterdayStr, twoDaysAgoStr],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    expect(await screen.findByText(/streak: 3/i)).toBeInTheDocument()
  })

  it('should display completion status for today', async () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] + 'T00:00:00.000Z'

    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [todayStr],
      }),
      createMockHabit({
        id: '2',
        name: 'Read',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const completedBadges = await screen.findAllByText(/completed today/i)
    const notCompletedBadges = await screen.findAllByText(/not completed today/i)
    
    expect(completedBadges.length).toBeGreaterThan(0)
    expect(notCompletedBadges.length).toBeGreaterThan(0)
  })

  it('should handle habits without name or description', async () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] + 'T00:00:00.000Z'

    const habits = [
      createMockHabit({
        id: '1',
        name: undefined,
        description: undefined,
        completionDates: [todayStr],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const habitItems = await screen.findAllByRole('listitem')
    expect(habitItems.length).toBeGreaterThan(0)
  })

  it('should display zero streak when habit has no completions', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    expect(await screen.findByText(/streak: 0/i)).toBeInTheDocument()
  })
})

