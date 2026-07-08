import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryForm } from './CategoryForm'
import { renderWithProviders } from '../../../test/utils/render-helpers'
import { createMockCategory } from '../../../test/fixtures/categories'
import { openDB, getAllHabits, getAllCategories, addCategory, updateCategory } from '../../../services/indexedDB'

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

describe('CategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])
    vi.mocked(getAllCategories).mockResolvedValue([])
    vi.mocked(addCategory).mockResolvedValue('new-id')
    vi.mocked(updateCategory).mockResolvedValue('c1')
  })

  it('renders empty create form by default', () => {
    renderWithProviders(<CategoryForm />)
    expect(screen.getByText(/create category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toHaveValue('')
  })

  it('creates a category on submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryForm />)

    await user.type(screen.getByLabelText(/name/i), 'Health')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    await waitFor(() =>
      expect(vi.mocked(addCategory)).toHaveBeenCalledWith(expect.objectContaining({ name: 'Health' }))
    )
  })

  it('shows a validation error when the name is empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryForm />)

    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(vi.mocked(addCategory)).not.toHaveBeenCalled()
  })

  it('pre-fills and updates an existing category', async () => {
    const user = userEvent.setup()
    const category = createMockCategory({ id: 'c1', name: 'Old' })
    renderWithProviders(<CategoryForm category={category} />)

    const nameInput = screen.getByLabelText(/name/i)
    expect(nameInput).toHaveValue('Old')
    await user.clear(nameInput)
    await user.type(nameInput, 'New')
    await user.click(screen.getByRole('button', { name: /^update$/i }))

    await waitFor(() =>
      expect(vi.mocked(updateCategory)).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'c1', name: 'New' })
      )
    )
  })
})
