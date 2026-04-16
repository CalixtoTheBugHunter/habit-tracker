import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { StatisticsView } from './StatisticsView'
import { renderWithProviders } from '../../test/utils/render-helpers'
import { createMockHabit } from '../../test/fixtures/habits'
import { createDateStrings } from '../../test/utils/date-helpers'
import { getAllHabits, openDB } from '../../services/indexedDB'

vi.mock('../../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
  testUtils: {
    resetDB: vi.fn(),
  },
}))

vi.mock('../../services/migration', () => ({
  runMigrations: vi.fn(),
  migrations: [],
}))

describe('StatisticsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
  })

  it('should render title', async () => {
    vi.mocked(getAllHabits).mockResolvedValue([])

    renderWithProviders(<StatisticsView />)

    expect(await screen.findByRole('heading', { name: /statistics/i })).toBeInTheDocument()
  })

  it('should render empty state when no habits exist', async () => {
    vi.mocked(getAllHabits).mockResolvedValue([])

    renderWithProviders(<StatisticsView />)

    expect(await screen.findByText(/no habits yet/i)).toBeInTheDocument()
  })

  it('should render statistics card for each habit', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: createDateStrings([0, 1, 2]),
      }),
      createMockHabit({
        id: '2',
        name: 'Read',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: createDateStrings([0]),
      }),
    ]
    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<StatisticsView />)

    expect(await screen.findByText('Exercise')).toBeInTheDocument()
    expect(await screen.findByText('Read')).toBeInTheDocument()
  })

  it('should display streak statistics for a habit', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: createDateStrings([0, 1, 2]),
      }),
    ]
    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<StatisticsView />)

    await screen.findByText('Exercise')
    expect(screen.getByText(/current streak/i)).toBeInTheDocument()
    expect(screen.getByText(/longest streak/i)).toBeInTheDocument()
    expect(screen.getByText(/days tracked/i)).toBeInTheDocument()
  })

  it('should display completion rate progress bars', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: createDateStrings([0, 1]),
      }),
    ]
    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<StatisticsView />)

    await screen.findByText('Exercise')
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars.length).toBe(3) // completion, weekly, monthly
  })

  it('should render annual calendar for each habit', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }),
    ]
    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<StatisticsView />)

    await screen.findByText('Exercise')
    expect(screen.getByLabelText(/annual completion calendar/i)).toBeInTheDocument()
  })

  it('should handle habits with no completions', async () => {
    const habits = [
      createMockHabit({
        id: '1',
        name: 'Exercise',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }),
    ]
    vi.mocked(getAllHabits).mockResolvedValue(habits)

    renderWithProviders(<StatisticsView />)

    await screen.findByText('Exercise')
    // Should render 0% progress bars without errors
    const progressBars = screen.getAllByRole('progressbar')
    progressBars.forEach(bar => {
      expect(bar).toHaveAttribute('aria-valuenow', '0')
    })
  })
})
