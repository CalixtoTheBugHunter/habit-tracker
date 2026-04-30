import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArchivedHabitsView } from './ArchivedHabitsView'
import { renderWithProviders } from '../../test/utils/render-helpers'
import { createMockHabit } from '../../test/fixtures/habits'
import { getAllHabits, openDB, updateHabit, deleteHabit } from '../../services/indexedDB'

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

describe('ArchivedHabitsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
  })

  it('always renders the title', async () => {
    vi.mocked(getAllHabits).mockResolvedValue([])
    renderWithProviders(<ArchivedHabitsView />)
    expect(await screen.findByRole('heading', { name: /archived habits/i })).toBeInTheDocument()
  })

  it('renders empty state when there are no archived habits', async () => {
    vi.mocked(getAllHabits).mockResolvedValue([
      createMockHabit({ id: '1', name: 'Active' }),
    ])
    renderWithProviders(<ArchivedHabitsView />)
    expect(await screen.findByText(/no archived habits/i)).toBeInTheDocument()
  })

  it('renders archived habit with name, description, and archived-on date', async () => {
    const archivedAt = '2026-04-30T00:00:00.000Z'
    vi.mocked(getAllHabits).mockResolvedValue([
      createMockHabit({
        id: '1',
        name: 'Old Habit',
        description: 'Used to do this daily',
        archivedAt,
      }),
    ])
    renderWithProviders(<ArchivedHabitsView />)

    expect(await screen.findByText('Old Habit')).toBeInTheDocument()
    expect(screen.getByText('Used to do this daily')).toBeInTheDocument()
    const expectedDate = new Date(archivedAt).toLocaleDateString()
    expect(screen.getByText(new RegExp(expectedDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument()
  })

  it('restore button calls updateHabit without archivedAt', async () => {
    const user = userEvent.setup()
    vi.mocked(getAllHabits).mockResolvedValue([
      createMockHabit({ id: '1', name: 'Old Habit', archivedAt: '2026-04-30T00:00:00.000Z' }),
    ])
    vi.mocked(updateHabit).mockResolvedValue('1')

    renderWithProviders(<ArchivedHabitsView />)

    const restoreButton = await screen.findByRole('button', { name: /restore old habit/i })
    await user.click(restoreButton)

    await waitFor(() => {
      expect(updateHabit).toHaveBeenCalledTimes(1)
    })
    const restoredHabit = vi.mocked(updateHabit).mock.calls[0]![0]
    expect(restoredHabit.id).toBe('1')
    expect(restoredHabit.archivedAt).toBeUndefined()
  })

  it('delete button opens confirmation modal; confirm calls deleteHabit', async () => {
    const user = userEvent.setup()
    vi.mocked(getAllHabits)
      .mockResolvedValueOnce([
        createMockHabit({ id: '1', name: 'Old Habit', archivedAt: '2026-04-30T00:00:00.000Z' }),
      ])
      .mockResolvedValueOnce([])
    vi.mocked(deleteHabit).mockResolvedValue()

    renderWithProviders(<ArchivedHabitsView />)

    const deleteButton = await screen.findByRole('button', { name: /permanently delete old habit/i })
    await user.click(deleteButton)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/permanently delete habit/i)).toBeInTheDocument()

    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(deleteHabit).toHaveBeenCalledWith('1')
    })
  })

  it('delete modal cancel does not call deleteHabit', async () => {
    const user = userEvent.setup()
    vi.mocked(getAllHabits).mockResolvedValue([
      createMockHabit({ id: '1', name: 'Old Habit', archivedAt: '2026-04-30T00:00:00.000Z' }),
    ])

    renderWithProviders(<ArchivedHabitsView />)

    const deleteButton = await screen.findByRole('button', { name: /permanently delete old habit/i })
    await user.click(deleteButton)

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(deleteHabit).not.toHaveBeenCalled()
  })
})
