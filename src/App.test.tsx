import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { openDB, getAllHabits } from './services/indexedDB'
import { testUtils } from './services/indexedDB'
import { createMockHabit } from './test/fixtures/habits'

vi.mock('./services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  testUtils: {
    resetDB: vi.fn(),
  },
}))

const { resetDB } = testUtils

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDB()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state during initialization', () => {
    vi.mocked(openDB).mockImplementation(
      () => new Promise(() => {})
    )

    render(<App />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('initializes IndexedDB connection on mount', async () => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])

    render(<App />)

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

    render(<App />)

    await waitFor(() => {
      expect(getAllHabits).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/total habits: 2/i)).toBeInTheDocument()
    })
  })

  it('renders the habit tracker title after initialization', async () => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])

    render(<App />)

    await waitFor(() => {
      const title = screen.getByRole('heading', { name: /habit tracker/i })
      expect(title).toBeInTheDocument()
    })
  })

  it('renders the app description after initialization', async () => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])

    render(<App />)

    await waitFor(() => {
      const description = screen.getByText(/A simple, free and offline habit tracker/)
      expect(description).toBeInTheDocument()
    })
  })

  it('handles IndexedDB initialization errors', async () => {
    const errorMessage = 'IndexedDB is not supported in this browser'
    vi.mocked(openDB).mockRejectedValue(new Error(errorMessage))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
    })
  })

  it('handles quota exceeded errors with user-friendly message', async () => {
    const errorMessage = 'Storage quota exceeded. Please free up some space.'
    vi.mocked(openDB).mockRejectedValue(new Error(errorMessage))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
    })
  })

  it('handles errors when loading habits', async () => {
    const errorMessage = 'Failed to get all habits'
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockRejectedValue(new Error(errorMessage))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
    })
  })

  it('handles non-Error exceptions', async () => {
    vi.mocked(openDB).mockRejectedValue('String error')

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/failed to initialize application/i)).toBeInTheDocument()
    })
  })
})

