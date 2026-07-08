import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryFilterBar } from './CategoryFilterBar'
import { renderWithProviders } from '../../../test/utils/render-helpers'
import { createMockCategory } from '../../../test/fixtures/categories'
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

describe('CategoryFilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])
    vi.mocked(getAllCategories).mockResolvedValue([])
  })

  it('renders nothing when there are no categories', async () => {
    const { container } = renderWithProviders(<CategoryFilterBar />)
    await waitFor(() => expect(vi.mocked(getAllCategories)).toHaveBeenCalled())
    expect(container.querySelector('.category-filter')).toBeNull()
  })

  it('renders an "All" chip and a chip per category', async () => {
    vi.mocked(getAllCategories).mockResolvedValue([
      createMockCategory({ id: 'a', name: 'Health' }),
      createMockCategory({ id: 'b', name: 'Work' }),
    ])
    renderWithProviders(<CategoryFilterBar />)

    expect(await screen.findByRole('button', { name: /show all habits/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /filter by health/i })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /filter by work/i })).toBeInTheDocument()
  })

  it('toggles a category chip active state on click', async () => {
    const user = userEvent.setup()
    vi.mocked(getAllCategories).mockResolvedValue([createMockCategory({ id: 'a', name: 'Health' })])
    renderWithProviders(<CategoryFilterBar />)

    const chip = await screen.findByRole('button', { name: /filter by health/i })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })
})
