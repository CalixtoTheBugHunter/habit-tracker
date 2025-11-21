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

  it.each([
    { scenario: 'title', text: /habit tracker/i, role: 'heading' },
    { scenario: 'description', text: /A simple, free and offline habit tracker/ },
  ])('renders $scenario after initialization', async ({ text, role }) => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])

    renderWithProviders(<App />)

    await waitFor(() => {
      if (role) {
        const element = screen.getByRole(role, { name: text })
        expect(element).toBeInTheDocument()
      } else {
        const element = screen.getByText(text)
        expect(element).toBeInTheDocument()
      }
    })
  })

  it('renders total habits count after initialization', async () => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])

    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText(/total habits: 0/i)).toBeInTheDocument()
    })
  })

  it('handles errors and displays them in App UI', async () => {
    const errorMessage = 'IndexedDB is not supported in this browser'
    vi.mocked(openDB).mockRejectedValue(new Error(errorMessage))

    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
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

