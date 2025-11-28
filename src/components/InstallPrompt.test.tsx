import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { render } from '@testing-library/react'
import { InstallPrompt } from './InstallPrompt'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

describe('InstallPrompt', () => {
  let originalMatchMedia: typeof window.matchMedia
  let mockPrompt: () => Promise<void>
  let mockUserChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    mockPrompt = vi.fn().mockResolvedValue(undefined) as () => Promise<void>
    mockUserChoice = Promise.resolve({ outcome: 'accepted' as const })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }),
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    })
    vi.restoreAllMocks()
  })

  it('should not render when app is already installed', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query === '(display-mode: standalone)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }
    })

    render(<InstallPrompt />)

    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument()
  })

  it('should not render when beforeinstallprompt event is not fired', () => {
    render(<InstallPrompt />)

    expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument()
  })

  it('should render install button when beforeinstallprompt event is fired', async () => {
    render(<InstallPrompt />)

    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent
    event.preventDefault = vi.fn()
    event.prompt = mockPrompt
    event.userChoice = mockUserChoice

    act(() => {
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument()
    })
  })

  it('should call prompt when install button is clicked', async () => {
    render(<InstallPrompt />)

    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent
    event.preventDefault = vi.fn()
    event.prompt = mockPrompt
    event.userChoice = mockUserChoice

    act(() => {
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument()
    })

    const installButton = screen.getByRole('button', { name: /install/i })
    await act(async () => {
      installButton.click()
    })

    expect(mockPrompt).toHaveBeenCalled()
  })

  it('should hide install button after successful installation', async () => {
    render(<InstallPrompt />)

    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent
    event.preventDefault = vi.fn()
    event.prompt = mockPrompt
    event.userChoice = Promise.resolve({ outcome: 'accepted' as const })

    act(() => {
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument()
    })

    const installButton = screen.getByRole('button', { name: /install/i })
    await act(async () => {
      installButton.click()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument()
    })
  })

  it('should hide install button when appinstalled event is fired', async () => {
    render(<InstallPrompt />)

    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent
    event.preventDefault = vi.fn()
    event.prompt = mockPrompt
    event.userChoice = mockUserChoice

    act(() => {
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument()
    })

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /install/i })).not.toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', async () => {
    render(<InstallPrompt />)

    const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent
    event.preventDefault = vi.fn()
    event.prompt = mockPrompt
    event.userChoice = mockUserChoice

    act(() => {
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      const installButton = screen.getByRole('button', { name: /install/i })
      expect(installButton).toHaveAttribute('aria-label', 'Install Habit Tracker app')
      expect(installButton).toHaveAttribute('title', 'Install Habit Tracker app')
    })
  })
})

