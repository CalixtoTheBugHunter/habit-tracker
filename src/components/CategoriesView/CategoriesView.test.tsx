import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoriesView } from './CategoriesView'
import { renderWithProviders } from '../../test/utils/render-helpers'
import { createMockCategory } from '../../test/fixtures/categories'
import { openDB, getAllHabits, getAllCategories } from '../../services/indexedDB'

vi.mock('../../services/indexedDB', () => ({
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

vi.mock('../../services/migration', () => ({
  runMigrations: vi.fn(),
  migrations: [],
}))

describe('CategoriesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])
    vi.mocked(getAllCategories).mockResolvedValue([createMockCategory({ id: 'c1', name: 'Health' })])
  })

  it('renders the title, create form, and category list', async () => {
    renderWithProviders(<CategoriesView />)
    expect(screen.getByRole('heading', { name: /categories/i })).toBeInTheDocument()
    expect(screen.getByText(/create category/i)).toBeInTheDocument()
    expect(await screen.findByText('Health')).toBeInTheDocument()
  })

  it('loads a category into the form when editing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoriesView />)

    await user.click(await screen.findByRole('button', { name: /edit health/i }))

    expect(await screen.findByText(/edit category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toHaveValue('Health')
  })
})
