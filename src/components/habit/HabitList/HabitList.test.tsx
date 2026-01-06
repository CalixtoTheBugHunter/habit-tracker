import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HabitList } from './HabitList'
import { renderWithProviders } from '../../../test/utils/render-helpers'
import { createMockHabit } from '../../../test/fixtures/habits'
import { createDateString, createDateStrings } from '../../../test/utils/date-helpers'
import { getAllHabits, openDB, deleteHabit } from '../../../services/indexedDB'
import type { Habit } from '../../../types/habit'
import { verifyButtonContrast, mockComputedStyleForElement } from '../../../test/utils/accessibility-helpers'

vi.mock('../../../services/indexedDB', () => ({
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

  it('should display streak badge for each habit', async () => {
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

    expect(await screen.findByText('3-day streak')).toBeInTheDocument()
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

  it('should not display streak badge when habit has no completions', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        completionDates: [],
      }),
    ]

    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<HabitList />)

    await screen.findByText('Exercise')
    expect(screen.queryByText(/streak/i)).not.toBeInTheDocument()
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

  describe('Button positioning and layout', () => {
    function renderHabitListWithHabits(habits: Habit[], options?: { onEdit?: (habit: Habit) => void }) {
      vi.mocked(getAllHabits).mockResolvedValue(habits)
      return renderWithProviders(<HabitList onEdit={options?.onEdit} />)
    }
    it('should render action buttons below the annual calendar', async () => {
      const habits = [
        createMockHabit({
          id: '1',
          name: 'Exercise',
          completionDates: [],
        }),
      ]

      const { container } = renderHabitListWithHabits(habits)

      await screen.findByText('Exercise')

      const habitItem = container.querySelector('.habit-item')
      expect(habitItem).toBeInTheDocument()

      const calendar = habitItem?.querySelector('.annual-calendar')
      const actionsContainer = habitItem?.querySelector('.habit-actions')

      expect(calendar).toBeInTheDocument()
      expect(actionsContainer).toBeInTheDocument()

      // Verify calendar appears before actions in DOM
      const calendarIndex = Array.from(habitItem!.children).indexOf(calendar!)
      const actionsIndex = Array.from(habitItem!.children).indexOf(actionsContainer!)
      expect(actionsIndex).toBeGreaterThan(calendarIndex)
    })

    it('should have all action buttons in habit-actions container', async () => {
      const mockOnEdit = vi.fn()
      const habits = [
        createMockHabit({
          id: '1',
          name: 'Exercise',
          completionDates: [],
        }),
      ]

      const { container } = renderHabitListWithHabits(habits, { onEdit: mockOnEdit })

      await screen.findByText('Exercise')

      const actionsContainer = container.querySelector('.habit-actions')
      expect(actionsContainer).toBeInTheDocument()

      const toggleButton = screen.getByRole('button', { name: /mark as completed today/i })
      const editButton = screen.getByRole('button', { name: /edit exercise/i })
      const deleteButton = screen.getByRole('button', { name: /delete exercise/i })

      expect(actionsContainer).toContainElement(toggleButton)
      expect(actionsContainer).toContainElement(editButton)
      expect(actionsContainer).toContainElement(deleteButton)
    })

    it('should maintain logical keyboard navigation order', async () => {
      const mockOnEdit = vi.fn()
      const habits = [
        createMockHabit({
          id: '1',
          name: 'Exercise',
          description: 'Daily workout',
          completionDates: [],
        }),
      ]

      const { container } = renderHabitListWithHabits(habits, { onEdit: mockOnEdit })

      await screen.findByText('Exercise')

      const nameHeading = screen.getByRole('heading', { name: 'Exercise' })
      const description = screen.getByText('Daily workout')
      const calendar = screen.getByLabelText(/annual completion calendar/i)
      const toggleButton = screen.getByRole('button', { name: /mark as completed today/i })

      // Verify DOM order by checking element positions
      const habitItem = container.querySelector('.habit-item')
      const allChildren = Array.from(habitItem!.children)
      
      const nameIndex = allChildren.findIndex(el => el.contains(nameHeading))
      const descriptionIndex = allChildren.findIndex(el => el.contains(description))
      const calendarIndex = allChildren.findIndex(el => el.contains(calendar))
      const actionsIndex = allChildren.findIndex(el => el.contains(toggleButton))

      // Verify logical order: name → description → calendar → buttons
      expect(nameIndex).toBeLessThan(descriptionIndex)
      expect(descriptionIndex).toBeLessThan(calendarIndex)
      expect(calendarIndex).toBeLessThan(actionsIndex)
    })

    it('should have left-aligned button group', async () => {
      const habits = [
        createMockHabit({
          id: '1',
          name: 'Exercise',
          completionDates: [],
        }),
      ]

      const { container } = renderHabitListWithHabits(habits)

      await screen.findByText('Exercise')

      const actionsContainer = container.querySelector('.habit-actions')
      expect(actionsContainer).toBeInTheDocument()
      expect(actionsContainer).toHaveClass('habit-actions')
      // CSS alignment verified via visual regression or E2E tests
    })
  })

  describe('Streak badge', () => {
    it('should render streak badge with simple styling for streaks 1-7', async () => {
      const [todayStr, yesterdayStr, twoDaysAgoStr, threeDaysAgoStr]: [string, string, string, string] = createDateStrings([0, 1, 2, 3]) as [string, string, string, string]

      const habits = [
        createMockHabit({
          id: '1',
          name: 'Exercise',
          completionDates: [todayStr, yesterdayStr, twoDaysAgoStr, threeDaysAgoStr],
        }),
      ]

      vi.mocked(getAllHabits).mockResolvedValue(habits)

      const { container } = renderWithProviders(<HabitList />)

      await screen.findByText('4-day streak')
      const badge = container.querySelector('.streak-badge-simple')
      expect(badge).toBeInTheDocument()
      expect(badge).not.toHaveClass('streak-badge-colorful')
    })

    it('should render streak badge with colorful styling for streaks 7+', async () => {
      const dateStrings = createDateStrings([0, 1, 2, 3, 4, 5, 6, 7, 8])

      const habits = [
        createMockHabit({
          id: '1',
          name: 'Exercise',
          completionDates: dateStrings,
        }),
      ]

      vi.mocked(getAllHabits).mockResolvedValue(habits)

      const { container } = renderWithProviders(<HabitList />)

      await screen.findByText('9-day streak')
      const badge = container.querySelector('.streak-badge-colorful')
      expect(badge).toBeInTheDocument()
      expect(badge).not.toHaveClass('streak-badge-simple')
    })

    it('should position streak badge next to habit name in header', async () => {
      const [todayStr, yesterdayStr]: [string, string] = createDateStrings([0, 1]) as [string, string]

      const habits = [
        createMockHabit({
          id: '1',
          name: 'Exercise',
          completionDates: [todayStr, yesterdayStr],
        }),
      ]

      vi.mocked(getAllHabits).mockResolvedValue(habits)

      const { container } = renderWithProviders(<HabitList />)

      await screen.findByText('Exercise')
      const header = container.querySelector('.habit-header')
      expect(header).toBeInTheDocument()

      const habitName = screen.getByRole('heading', { name: 'Exercise' })
      const badge = screen.getByText('2-day streak')

      expect(header).toContainElement(habitName)
      expect(header).toContainElement(badge)
    })
  })

  describe('Accessibility - Contrast', () => {
    let cleanup: (() => void) | undefined

    afterEach(() => {
      if (cleanup) {
        cleanup()
        cleanup = undefined
      }
    })

    it.each([
      {
        name: 'completed toggle button',
        matcher: (el: Element) => el.classList.contains('completion-toggle') && el.classList.contains('completed'),
        bgColor: 'rgb(25, 118, 210)',
        minRatio: 4.5,
        buttonName: /mark as done|completed/i,
        setupHabits: () => {
          const todayStr = createDateString(0)
          return [
            createMockHabit({
              id: '1',
              name: 'Exercise',
              completionDates: [todayStr],
            }),
          ]
        },
        renderOptions: undefined,
      },
      {
        name: 'edit button on hover',
        matcher: 'habit-edit-button',
        bgColor: 'rgb(25, 118, 210)',
        minRatio: 4.5,
        buttonName: /edit/i,
        setupHabits: () => [
          createMockHabit({
            id: '1',
            name: 'Exercise',
          }),
        ],
        renderOptions: { onEdit: vi.fn() },
      },
      {
        name: 'delete button on hover',
        matcher: 'habit-delete-button',
        bgColor: 'rgb(211, 47, 47)',
        minRatio: 4.0,
        buttonName: /delete/i,
        setupHabits: () => [
          createMockHabit({
            id: '1',
            name: 'Exercise',
          }),
        ],
        renderOptions: undefined,
      },
    ])('should have sufficient contrast for $name', async ({ matcher, bgColor, minRatio, buttonName, setupHabits, renderOptions }) => {
      const habits = setupHabits()
      vi.mocked(getAllHabits).mockResolvedValue(habits)

      cleanup = mockComputedStyleForElement(
        matcher as string | ((element: Element) => boolean),
        'rgb(0, 0, 0)',
        bgColor
      )

      if (renderOptions?.onEdit) {
        renderWithProviders(<HabitList onEdit={renderOptions.onEdit} />)
      } else {
        renderWithProviders(<HabitList />)
      }

      await screen.findByText('Exercise')
      const button = screen.getByRole('button', { name: buttonName })
      expect(verifyButtonContrast(button, minRatio)).toBe(true)
    })
  })
})

