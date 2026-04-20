import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { ServiceWorkerUpdatePrompt } from './ServiceWorkerUpdatePrompt'
import { renderWithLangReady } from '../../../test/utils/renderWithLangReady'

function dispatchUpdateEvent(registration?: Partial<ServiceWorkerRegistration>) {
  window.dispatchEvent(new CustomEvent('sw-update-ready', { detail: { registration } }))
}

describe('ServiceWorkerUpdatePrompt', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>
  let reloadMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should not render initially', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('should render when sw-update-ready event is dispatched', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      dispatchUpdateEvent()
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('A new version is available')).toBeInTheDocument()
    })
  })

  it('should call window.location.reload when "Reload now" is clicked', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      dispatchUpdateEvent()
    })

    await waitFor(() => {
      expect(screen.getByText('Reload now')).toBeInTheDocument()
    })

    await act(async () => {
      screen.getByText('Reload now').click()
    })

    expect(reloadMock).toHaveBeenCalled()
  })

  it('should postMessage SKIP_WAITING to waiting worker before reload', async () => {
    const postMessageMock = vi.fn()
    const mockRegistration = { waiting: { postMessage: postMessageMock } }

    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      dispatchUpdateEvent(mockRegistration as unknown as ServiceWorkerRegistration)
    })

    await waitFor(() => {
      expect(screen.getByText('Reload now')).toBeInTheDocument()
    })

    await act(async () => {
      screen.getByText('Reload now').click()
    })

    expect(postMessageMock).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(reloadMock).toHaveBeenCalled()
  })

  it('should hide when "Later" is clicked', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      dispatchUpdateEvent()
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    await act(async () => {
      screen.getByText('Later').click()
    })

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('should reappear when sw-update-ready fires again after dismiss', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      dispatchUpdateEvent()
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    await act(async () => {
      screen.getByText('Later').click()
    })

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    act(() => {
      dispatchUpdateEvent()
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      dispatchUpdateEvent()
    })

    await waitFor(() => {
      const statusElement = screen.getByRole('status')
      expect(statusElement).toHaveAttribute('aria-live', 'polite')
      expect(statusElement).toHaveAttribute('aria-atomic', 'true')
      expect(statusElement).toHaveAttribute('aria-label', 'Application update available')
    })

    const dismissButton = screen.getByText('Later')
    expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss update notification')
  })

  it('should add event listener on mount and remove on unmount', async () => {
    const { unmount } = await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    expect(addEventListenerSpy).toHaveBeenCalledWith('sw-update-ready', expect.any(Function))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('sw-update-ready', expect.any(Function))
  })
})
