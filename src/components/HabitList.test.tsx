import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HabitList } from './HabitList'
import { renderWithProviders } from '../test/utils/render-helpers'
import { createMockHabit } from '../test/fixtures/habits'
import { createDateString, createDateStrings } from '../test/utils/date-helpers'
import { getAllHabits, openDB, deleteHabit } from '../services/indexedDB'

vi.mock('../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  deleteHabit: vi.fn(),
  testUtils: {
    resetDB: vi.fn(),
  },
}))

describe('HabitList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // openDB is required because HabitContext calls it during initialization
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
  })

  it('should render empty state when no habits exist', async () => {
    vi.mocked(getAllHabits).mockResolvedValue([])

    renderWithProviders(<HabitList />)

    expect(await screen.findByText(/no habits yet/i)).toBeInTheDocument()
  })

  it('should render list of habits with name, description, and streak', async () => {
    const [todayStr, yesterdayStr]: [string, string] = createDateStrings([0, 1]) as [string, string]

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
    const [todayStr, yesterdayStr, twoDaysAgoStr]: [string, string, string] = createDateStrings([0, 1, 2]) as [string, string, string]

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
    const todayStr = createDateString(0)

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

    const completedButton = await screen.findByRole('button', { name: /mark as not completed today/i })
    const notCompletedButton = await screen.findByRole('button', { name: /mark as completed today/i })
    
    expect(completedButton).toBeInTheDocument()
    expect(notCompletedButton).toBeInTheDocument()
  })

  it('should handle habits without name or description', async () => {
    const todayStr = createDateString(0)

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

  it('should render toggle completion button for each habit', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const toggleButton = await screen.findByRole('button', { name: /mark as completed today/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('should display completed state when habit is completed today', async () => {
    const todayStr = createDateString(0)
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [todayStr],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const completedButton = await screen.findByRole('button', { name: /completed/i })
    expect(completedButton).toBeInTheDocument()
    expect(completedButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('should have accessible toggle button with correct aria attributes', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
      createMockHabit({
        id: '2',
        name: 'Read',
        completionDates: [createDateString(0)],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const notCompletedButton = await screen.findByRole('button', { name: /mark as completed today/i })
    expect(notCompletedButton).toHaveAttribute('aria-pressed', 'false')

    const completedButton = await screen.findByRole('button', { name: /mark as not completed today/i })
    expect(completedButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('should render delete button for each habit', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const deleteButton = await screen.findByRole('button', { name: /delete exercise/i })
    expect(deleteButton).toBeInTheDocument()
  })

  it('should show confirmation modal when delete button is clicked', async () => {
    const user = userEvent.setup()
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const deleteButton = await screen.findByRole('button', { name: /delete exercise/i })
    await user.click(deleteButton)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete Habit')).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to delete "exercise"/i)).toBeInTheDocument()
  })

  it('should delete habit when confirmed in modal', async () => {
    const user = userEvent.setup()
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits)
      .mockResolvedValueOnce(habits)
      .mockResolvedValueOnce([])
    vi.mocked(deleteHabit).mockResolvedValue()

    renderWithProviders(<HabitList />)

    const deleteButton = await screen.findByRole('button', { name: /delete exercise/i })
    await user.click(deleteButton)

    const confirmButton = await screen.findByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(deleteHabit).toHaveBeenCalledWith('1')
    })
  })

  it('should not delete habit when modal is cancelled', async () => {
    const user = userEvent.setup()
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const deleteButton = await screen.findByRole('button', { name: /delete exercise/i })
    await user.click(deleteButton)

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(deleteHabit).not.toHaveBeenCalled()
  })

  it('should handle delete errors', async () => {
    const user = userEvent.setup()
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)
    vi.mocked(deleteHabit).mockRejectedValue(new Error('Failed to delete habit'))

    renderWithProviders(<HabitList />)

    const deleteButton = await screen.findByRole('button', { name: /delete exercise/i })
    await user.click(deleteButton)

    const confirmButton = await screen.findByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to delete habit/i)).toBeInTheDocument()
    })
  })

  it('should handle delete button for habit without name', async () => {
    const user = userEvent.setup()
    const habits = [
      createMockHabit({
        id: '1',
        name: undefined,
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    const deleteButton = await screen.findByRole('button', { name: /delete habit/i })
    expect(deleteButton).toBeInTheDocument()

    await user.click(deleteButton)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to delete "this habit"/i)).toBeInTheDocument()
  })
})

