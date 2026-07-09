import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryList } from './CategoryList'
import { renderWithProviders } from '../../../test/utils/render-helpers'
import { createMockCategory } from '../../../test/fixtures/categories'
import { openDB, getAllHabits, getAllCategories, deleteCategory } from '../../../services/indexedDB'

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

describe('CategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])
    vi.mocked(getAllCategories).mockResolvedValue([
      createMockCategory({ id: 'c1', name: 'Health' }),
    ])
    vi.mocked(deleteCategory).mockResolvedValue()
  })

  it('shows the empty state when there are no categories', async () => {
    vi.mocked(getAllCategories).mockResolvedValue([])
    renderWithProviders(<CategoryList />)
    expect(await screen.findByText(/no categories yet/i)).toBeInTheDocument()
  })

  it('renders each category', async () => {
    renderWithProviders(<CategoryList />)
    expect(await screen.findByText('Health')).toBeInTheDocument()
  })

  it('calls onEdit when the edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    renderWithProviders(<CategoryList onEdit={onEdit} />)

    await user.click(await screen.findByRole('button', { name: /edit health/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1', name: 'Health' }))
  })

  it('deletes a category after confirmation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryList />)

    await user.click(await screen.findByRole('button', { name: /delete health/i }))
    const confirmButton = await screen.findByRole('button', { name: /^delete$/i })
    await user.click(confirmButton)

    await waitFor(() => expect(vi.mocked(deleteCategory)).toHaveBeenCalledWith('c1'))
  })
})
