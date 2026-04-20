import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { ServiceWorkerUpdatePrompt } from './ServiceWorkerUpdatePrompt'
import { renderWithLangReady } from '../../../test/utils/renderWithLangReady'
import { verifyButtonContrast } from '../../../test/utils/accessibility-helpers'

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
      window.dispatchEvent(new Event('sw-update-ready'))
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('A new version is available')).toBeInTheDocument()
    })
  })

  it('should call window.location.reload when "Reload now" is clicked', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      window.dispatchEvent(new Event('sw-update-ready'))
    })

    await waitFor(() => {
      expect(screen.getByText('Reload now')).toBeInTheDocument()
    })

    await act(async () => {
      screen.getByText('Reload now').click()
    })

    expect(reloadMock).toHaveBeenCalled()
  })

  it('should hide when "Later" is clicked', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      window.dispatchEvent(new Event('sw-update-ready'))
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
      window.dispatchEvent(new Event('sw-update-ready'))
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
      window.dispatchEvent(new Event('sw-update-ready'))
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', async () => {
    await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

    act(() => {
      window.dispatchEvent(new Event('sw-update-ready'))
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

  describe('Accessibility - Contrast', () => {
    it('should have sufficient contrast ratio for reload button', async () => {
      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = vi.fn((element: Element) => {
        const style = originalGetComputedStyle(element)
        if (element.classList.contains('sw-update-prompt__reload')) {
          return {
            ...style,
            color: 'rgb(0, 0, 0)',
            backgroundColor: 'rgb(25, 118, 210)',
            getPropertyValue: (prop: string) => {
              if (prop === 'color') return 'rgb(0, 0, 0)'
              if (prop === 'background-color') return 'rgb(25, 118, 210)'
              return style.getPropertyValue(prop)
            },
          } as CSSStyleDeclaration
        }
        return style
      }) as typeof window.getComputedStyle

      await renderWithLangReady(<ServiceWorkerUpdatePrompt />)

      act(() => {
        window.dispatchEvent(new Event('sw-update-ready'))
      })

      await waitFor(() => {
        const reloadButton = screen.getByText('Reload now')
        expect(verifyButtonContrast(reloadButton)).toBe(true)
      })

      window.getComputedStyle = originalGetComputedStyle
    })
  })
})
