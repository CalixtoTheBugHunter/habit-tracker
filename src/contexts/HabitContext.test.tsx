import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import React from 'react'
import { useHabits } from './HabitContext'
import { openDB, getAllHabits, updateHabit, deleteHabit } from '../services/indexedDB'
import { testUtils } from '../services/indexedDB'
import { createMockHabit } from '../test/fixtures/habits'
import { createDateString } from '../test/utils/date-helpers'
import { renderWithProviders, renderWithErrorBoundary } from '../test/utils/render-helpers'

vi.mock('../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
  testUtils: {
    resetDB: vi.fn(),
  },
}))

const { resetDB } = testUtils

function TestComponent() {
  const { habits, isLoading, error } = useHabits()
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {!isLoading && !error && <div>Habits: {habits.length}</div>}
    </div>
  )
}

function TestComponentWithRefresh({ onRefresh }: { onRefresh: (refreshFn: () => Promise<void>) => void }) {
  const { refreshHabits } = useHabits()
  React.useEffect(() => {
    onRefresh(refreshHabits)
  }, [refreshHabits, onRefresh])
  return <TestComponent />
}

function TestComponentWithToggle({ onToggle }: { onToggle: (toggleFn: (id: string) => Promise<void>) => void }) {
  const { toggleHabitCompletion } = useHabits()
  React.useEffect(() => {
    onToggle(toggleHabitCompletion)
  }, [toggleHabitCompletion, onToggle])
  return <TestComponent />
}

function TestComponentWithDelete({ onDelete }: { onDelete: (deleteFn: (id: string) => Promise<void>) => void }) {
  const { deleteHabit } = useHabits()
  React.useEffect(() => {
    onDelete(deleteHabit)
  }, [deleteHabit, onDelete])
  return <TestComponent />
}

describe('HabitContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDB()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('initializes IndexedDB connection on mount', async () => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(openDB).toHaveBeenCalledTimes(1)
    })
  })

  it('loads habits from IndexedDB after initialization', async () => {
    const mockHabits = [
      createMockHabit({ id: '1', name: 'Exercise' }),
      createMockHabit({ id: '2', name: 'Read' }),
    ]

    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue(mockHabits)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(getAllHabits).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/habits: 2/i)).toBeInTheDocument()
    })
  })

  it('provides loading state during initialization', () => {
    vi.mocked(openDB).mockImplementation(
      () => new Promise(() => {})
    )

    renderWithProviders(<TestComponent />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles IndexedDB initialization errors', async () => {
    vi.mocked(openDB).mockRejectedValue(new Error('IndexedDB is not supported in this browser'))

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByText(/failed to initialize application/i)).toBeInTheDocument()
    })
  })

  it('handles errors when loading habits', async () => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockRejectedValue(new Error('Failed to get all habits'))

    renderWithProviders(<TestComponent />)

    // When getAllHabits fails during initialization, the error is caught
    // by initializeApp and wrapped with "Failed to initialize application"
    await waitFor(() => {
      expect(screen.getByText(/failed to initialize application/i)).toBeInTheDocument()
    })
  })

  it('throws error when useHabits is used outside provider', async () => {
    let caughtError: Error | null = null
    renderWithErrorBoundary(<TestComponent />, (error) => {
      caughtError = error
    })

    await waitFor(() => {
      expect(caughtError).toBeTruthy()
    })

    expect(caughtError).toBeInstanceOf(Error)
    expect(caughtError!.message).toBe('useHabits must be used within a HabitProvider')
  })

  it('allows refreshing habits after initial load', async () => {
    const initialHabits = [createMockHabit({ id: '1', name: 'Exercise' })]
    const updatedHabits = [
      createMockHabit({ id: '1', name: 'Exercise' }),
      createMockHabit({ id: '2', name: 'Read' }),
    ]

    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValueOnce(initialHabits).mockResolvedValueOnce(updatedHabits)

    let refreshFn: (() => Promise<void>) | null = null
    const onRefresh = (fn: () => Promise<void>) => {
      refreshFn = fn
    }

    renderWithProviders(<TestComponentWithRefresh onRefresh={onRefresh} />)

    await waitFor(() => {
      expect(screen.getByText(/habits: 1/i)).toBeInTheDocument()
    })

    expect(refreshFn).not.toBeNull()
    await act(async () => {
      await refreshFn!()
    })

    await waitFor(() => {
      expect(screen.getByText(/habits: 2/i)).toBeInTheDocument()
      expect(getAllHabits).toHaveBeenCalledTimes(2)
    })
  })

  it('toggles habit completion and refreshes habits', async () => {
    const habit = createMockHabit({
      id: '1',
      name: 'Exercise',
      completionDates: [],
    })

    const updatedHabit = createMockHabit({
      id: '1',
      name: 'Exercise',
      completionDates: [createDateString(0)],
    })

    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits)
      .mockResolvedValueOnce([habit])
      .mockResolvedValueOnce([updatedHabit])
    vi.mocked(updateHabit).mockResolvedValue('1')

    let toggleFn: ((id: string) => Promise<void>) | null = null
    const onToggle = (fn: (id: string) => Promise<void>) => {
      toggleFn = fn
    }

    renderWithProviders(<TestComponentWithToggle onToggle={onToggle} />)

    await waitFor(() => {
      expect(screen.getByText(/habits: 1/i)).toBeInTheDocument()
    })

    expect(toggleFn).not.toBeNull()
    
    await act(async () => {
      await toggleFn!('1')
    })

    await waitFor(() => {
      expect(updateHabit).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(getAllHabits).toHaveBeenCalledTimes(2)
    })
  })

  it('handles errors when toggling completion for non-existent habit', async () => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    const habits = [createMockHabit({ id: '1', name: 'Exercise' })]
    vi.mocked(getAllHabits).mockResolvedValue(habits)

    let toggleFn: ((id: string) => Promise<void>) | null = null
    const onToggle = (fn: (id: string) => Promise<void>) => {
      toggleFn = fn
    }

    renderWithProviders(<TestComponentWithToggle onToggle={onToggle} />)

    await waitFor(() => {
      expect(screen.getByText(/habits: 1/i)).toBeInTheDocument()
    })

    expect(toggleFn).not.toBeNull()
    
    await act(async () => {
      try {
        await toggleFn!('non-existent')
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/failed to toggle habit completion/i)).toBeInTheDocument()
    })
  })

  it('handles errors when updateHabit fails', async () => {
    const habit = createMockHabit({
      id: '1',
      name: 'Exercise',
      completionDates: [],
    })

    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([habit])
    vi.mocked(updateHabit).mockRejectedValue(new Error('Failed to update habit'))

    let toggleFn: ((id: string) => Promise<void>) | null = null
    const onToggle = (fn: (id: string) => Promise<void>) => {
      toggleFn = fn
    }

    renderWithProviders(<TestComponentWithToggle onToggle={onToggle} />)

    await waitFor(() => {
      expect(screen.getByText(/habits: 1/i)).toBeInTheDocument()
    })

    expect(toggleFn).not.toBeNull()
    
    await act(async () => {
      try {
        await toggleFn!('1')
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/failed to toggle habit completion/i)).toBeInTheDocument()
    })
  })

  it('deletes a habit and refreshes habits', async () => {
    const habits = [
      createMockHabit({ id: '1', name: 'Exercise' }),
      createMockHabit({ id: '2', name: 'Read' }),
    ]

    const remainingHabits = [createMockHabit({ id: '2', name: 'Read' })]

    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits)
      .mockResolvedValueOnce(habits)
      .mockResolvedValueOnce(remainingHabits)
    vi.mocked(deleteHabit).mockResolvedValue()

    let deleteFn: ((id: string) => Promise<void>) | null = null
    const onDelete = (fn: (id: string) => Promise<void>) => {
      deleteFn = fn
    }

    renderWithProviders(<TestComponentWithDelete onDelete={onDelete} />)

    await waitFor(() => {
      expect(screen.getByText(/habits: 2/i)).toBeInTheDocument()
    })

    expect(deleteFn).not.toBeNull()
    
    await act(async () => {
      await deleteFn!('1')
    })

    await waitFor(() => {
      expect(deleteHabit).toHaveBeenCalledWith('1')
    })

    await waitFor(() => {
      expect(getAllHabits).toHaveBeenCalledTimes(2)
      expect(screen.getByText(/habits: 1/i)).toBeInTheDocument()
    })
  })

  it('handles errors when deleting a non-existent habit', async () => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    const habits = [createMockHabit({ id: '1', name: 'Exercise' })]
    vi.mocked(getAllHabits).mockResolvedValue(habits)
    vi.mocked(deleteHabit).mockRejectedValue(new Error('Failed to delete habit'))

    let deleteFn: ((id: string) => Promise<void>) | null = null
    const onDelete = (fn: (id: string) => Promise<void>) => {
      deleteFn = fn
    }

    renderWithProviders(<TestComponentWithDelete onDelete={onDelete} />)

    await waitFor(() => {
      expect(screen.getByText(/habits: 1/i)).toBeInTheDocument()
    })

    expect(deleteFn).not.toBeNull()
    
    await act(async () => {
      try {
        await deleteFn!('1')
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    })

    await waitFor(() => {
      expect(screen.getByText(/failed to delete habit/i)).toBeInTheDocument()
    })
  })
})

