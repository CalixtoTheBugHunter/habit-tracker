import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HabitFilterBar } from './HabitFilterBar'
import { renderWithProviders } from '../../../test/utils/render-helpers'
import { openDB, getAllHabits, getAllCategories } from '../../../services/indexedDB'

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
    vi.mocked(getAllHabits).mockResolvedValue([])
    vi.mocked(getAllCategories).mockResolvedValue([])
  })

  it('renders search, status, streak chips, sort, and clear controls', () => {
    renderWithProviders(<HabitFilterBar />)

    expect(screen.getByRole('searchbox', { name: /search habits/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /filter by status/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /sort by/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filter by streak: all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filter by streak: 1–7/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear all search and filter/i })).toBeInTheDocument()
  })

  it('updates the search input value as the user types', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    const search = screen.getByRole('searchbox', { name: /search habits/i })
    await user.type(search, 'run')
    expect(search).toHaveValue('run')
  })

  it('disables Clear initially, enables it after a change, and resets on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    const clear = screen.getByRole('button', { name: /clear all search and filter/i })
    expect(clear).toBeDisabled()

    const search = screen.getByRole('searchbox', { name: /search habits/i })
    await user.type(search, 'water')
    expect(clear).toBeEnabled()

    await user.click(clear)
    expect(search).toHaveValue('')
    expect(clear).toBeDisabled()
  })

  it('toggles a streak chip active state on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    const chip = screen.getByRole('button', { name: /filter by streak: 8–30/i })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('changes the sort selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HabitFilterBar />)

    const sort = screen.getByRole('combobox', { name: /sort by/i })
    await user.selectOptions(sort, 'streak')
    expect(sort).toHaveValue('streak')
  })
})
