import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCategories } from './CategoryContext'
import { renderWithProviders } from '../test/utils/render-helpers'
import { createMockCategory } from '../test/fixtures/categories'
import { createMockHabit } from '../test/fixtures/habits'
import { openDB, getAllHabits, getAllCategories, addCategory, deleteCategory, putHabits } from '../services/indexedDB'

vi.mock('../services/indexedDB', () => ({
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

vi.mock('../services/migration', () => ({
  runMigrations: vi.fn(),
  migrations: [],
}))

function Consumer() {
  const { categories, selectedCategoryIds, addCategory: add, deleteCategory: remove, toggleCategoryFilter } =
    useCategories()
  return (
    <div>
      <span data-testid="count">{categories.length}</span>
      <span data-testid="selected">{selectedCategoryIds.join(',')}</span>
      <button onClick={() => add('New')}>add</button>
      <button onClick={() => toggleCategoryFilter('c1')}>toggle</button>
      <button onClick={() => remove('c1')}>delete</button>
    </div>
  )
}

describe('CategoryContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])
    vi.mocked(getAllCategories).mockResolvedValue([createMockCategory({ id: 'c1', name: 'Health' })])
    vi.mocked(addCategory).mockResolvedValue('new-id')
    vi.mocked(deleteCategory).mockResolvedValue()
    vi.mocked(putHabits).mockResolvedValue()
  })

  it('loads categories on mount', async () => {
    renderWithProviders(<Consumer />)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))
  })

  it('adds a category', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Consumer />)
    await user.click(screen.getByRole('button', { name: 'add' }))
    await waitFor(() =>
      expect(vi.mocked(addCategory)).toHaveBeenCalledWith(expect.objectContaining({ name: 'New' }))
    )
  })

  it('toggles the category filter selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Consumer />)
    await user.click(screen.getByRole('button', { name: 'toggle' }))
    await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('c1'))
  })

  it('cascades a delete to habits that reference the category', async () => {
    vi.mocked(getAllHabits).mockResolvedValue([createMockHabit({ id: 'h1', categories: ['c1'] })])
    const user = userEvent.setup()
    renderWithProviders(<Consumer />)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))

    await user.click(screen.getByRole('button', { name: 'delete' }))

    await waitFor(() => expect(vi.mocked(deleteCategory)).toHaveBeenCalledWith('c1'))
    await waitFor(() => expect(vi.mocked(putHabits)).toHaveBeenCalled())
  })
})
