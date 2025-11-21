import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import React from 'react'
import { useHabits } from './HabitContext'
import { openDB, getAllHabits } from '../services/indexedDB'
import { testUtils } from '../services/indexedDB'
import { createMockHabit } from '../test/fixtures/habits'
import { renderWithProviders, renderWithErrorBoundary } from '../test/utils/render-helpers'

vi.mock('../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
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
    const errorMessage = 'IndexedDB is not supported in this browser'
    vi.mocked(openDB).mockRejectedValue(new Error(errorMessage))

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
    })
  })

  it('handles errors when loading habits', async () => {
    const errorMessage = 'Failed to get all habits'
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockRejectedValue(new Error(errorMessage))

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
    })
  })

  it('throws error when useHabits is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    let caughtError: Error | null = null
    renderWithErrorBoundary(<TestComponent />, (error) => {
      caughtError = error
    })

    expect(caughtError).toBeTruthy()
    expect(caughtError).toBeInstanceOf(Error)
    expect(caughtError!.message).toBe('useHabits must be used within a HabitProvider')

    consoleError.mockRestore()
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
})

