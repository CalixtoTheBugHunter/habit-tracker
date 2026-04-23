import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { openDB, getAllHabits } from './services/indexedDB'
import { testUtils } from './services/indexedDB'

vi.mock('./services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  testUtils: {
    resetDB: vi.fn(),
  },
}))

vi.mock('./services/migration', () => ({
  runMigrations: vi.fn(),
  migrations: [],
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

  it('renders title after initialization', async () => {
    const text = /atomic habit tracker/i
    const role = 'heading'
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])

    render(<App />)

    await waitFor(() => {
      const element = screen.getByRole(role, { name: text })
      expect(element).toBeInTheDocument()
      expect(element).toHaveClass('app-header__logo')
    })
  })

  it('handles errors and displays them in App UI', async () => {
    vi.mocked(openDB).mockRejectedValue(new Error('IndexedDB is not supported in this browser'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/failed to initialize application/i)).toBeInTheDocument()
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

