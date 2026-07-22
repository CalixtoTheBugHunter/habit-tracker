import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HabitFilterBar } from './HabitFilterBar'
import { renderWithProviders } from '../../../test/utils/render-helpers'
import { createMockHabit } from '../../../test/fixtures/habits'
import { openDB, getAllHabits, getAllCategories } from '../../../services/indexedDB'

// The toolbar only renders once more than four active habits exist, so seed
// enough habits for every "visible" test. Individual tests override as needed.
const seedHabits = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    createMockHabit({ id: `h${i}`, name: `Habit ${i}` })
  )

vi.mock('../../../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  getAllCategories: vi.fn(),
  addCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
  putHabits: vi.fn(),
  testUtils: { resetDB: vi.fn() },
}))

vi.mock('../../../services/migration', () => ({
  runMigrations: vi.fn(),
  migrations: [],
}))

describe('HabitFilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    // Seed more than four habits so the toolbar renders by default.
    vi.mocked(getAllHabits).mockResolvedValue(seedHabits(5))
    vi.mocked(getAllCategories).mockResolvedValue([])
  })

  it('renders nothing when there are four or fewer habits', async () => {
    vi.mocked(getAllHabits).mockResolvedValue(seedHabits(4))
    const { container } = renderWithProviders(<HabitFilterBar />)

    await waitFor(() => expect(vi.mocked(getAllHabits)).toHaveBeenCalled())
    expect(container.querySelector('.habit-filter')).toBeNull()
    expect(screen.queryByRole('searchbox', { name: /search habits/i })).not.toBeInTheDocument()
  })

  it('renders the toolbar once there are more than four habits', async () => {
    renderWithProviders(<HabitFilterBar />)

    expect(await screen.findByRole('searchbox', { name: /search habits/i })).toBeInTheDocument()
  })

  it('shows only the search field initially, keeping the advanced controls hidden', async () => {
    renderWithProviders(<HabitFilterBar />)

    expect(await screen.findByRole('searchbox', { name: /search habits/i })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /filter by status/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: /sort by/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /filter by streak: all/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear all search and filter/i })).not.toBeInTheDocument()
  })

  it('reveals the status, streak, sort, and clear controls once the toolbar has focus', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    await user.click(await screen.findByRole('searchbox', { name: /search habits/i }))

    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /sort by/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filter by streak: all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filter by streak: 1–7/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear all search and filter/i })).toBeInTheDocument()
  })

  it('collapses back to the search field when blurred with no active filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <button type="button">outside</button>
        <HabitFilterBar />
      </>
    )

    await user.click(await screen.findByRole('searchbox', { name: /search habits/i }))
    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'outside' }))
    expect(screen.queryByRole('combobox', { name: /filter by status/i })).not.toBeInTheDocument()
  })

  it('keeps the advanced controls visible after blur while a filter is active', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <button type="button">outside</button>
        <HabitFilterBar />
      </>
    )

    await user.type(await screen.findByRole('searchbox', { name: /search habits/i }), 'water')
    await user.click(screen.getByRole('button', { name: 'outside' }))

    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument()
  })

  it('updates the search input value as the user types', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    const search = await screen.findByRole('searchbox', { name: /search habits/i })
    await user.type(search, 'run')
    expect(search).toHaveValue('run')
  })

  it('disables Clear initially, enables it after a change, and resets on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    const search = await screen.findByRole('searchbox', { name: /search habits/i })
    await user.click(search)

    const clear = screen.getByRole('button', { name: /clear all search and filter/i })
    expect(clear).toBeDisabled()

    await user.type(search, 'water')
    expect(clear).toBeEnabled()

    await user.click(clear)
    expect(search).toHaveValue('')
    expect(clear).toBeDisabled()
  })

  it('toggles a streak chip active state on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    await user.click(await screen.findByRole('searchbox', { name: /search habits/i }))

    const chip = screen.getByRole('button', { name: /filter by streak: 8–30/i })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('changes the sort selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    await user.click(await screen.findByRole('searchbox', { name: /search habits/i }))

    const sort = screen.getByRole('combobox', { name: /sort by/i })
    await user.selectOptions(sort, 'streak')
    expect(sort).toHaveValue('streak')
  })
})
