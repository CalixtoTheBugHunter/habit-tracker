import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import App from './App'
import { openDB, getAllHabits } from './services/indexedDB'
import { testUtils } from './services/indexedDB'
import { renderWithProviders } from './test/utils/render-helpers'

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

  it('renders title after initialization', async () => {
    const text = /habit tracker/i
    const role = 'heading'
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])

    renderWithProviders(<App />)

    await waitFor(() => {
      const element = screen.getByRole(role, { name: text })
      expect(element).toBeInTheDocument()
      expect(element).toHaveClass('app-header__logo')
    })
  })

  it('handles errors and displays them in App UI', async () => {
    vi.mocked(openDB).mockRejectedValue(new Error('IndexedDB is not supported in this browser'))

    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText(/failed to initialize application/i)).toBeInTheDocument()
    })
  })

  it('handles non-Error exceptions', async () => {
    vi.mocked(openDB).mockRejectedValue('String error')

    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText(/failed to initialize application/i)).toBeInTheDocument()
    })
  })
})

