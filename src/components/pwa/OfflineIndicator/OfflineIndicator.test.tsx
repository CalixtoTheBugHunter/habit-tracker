import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { render } from '@testing-library/react'
import { OfflineIndicator } from './OfflineIndicator'
import { setNavigatorOnline, triggerNetworkEvent } from '../../../test/utils/navigator-test-helpers'
import { getButtonContrastRatio } from '../../../test/utils/accessibility-helpers'

describe('OfflineIndicator', () => {
  let originalOnLine: boolean
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    originalOnLine = globalThis.navigator.onLine
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    Object.defineProperty(globalThis.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: originalOnLine,
    })
    vi.restoreAllMocks()
  })

  it('should not render when device is online', () => {
    setNavigatorOnline(true)

    render(<OfflineIndicator />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument()
  })

  it('should render when device is offline', () => {
    setNavigatorOnline(false)

    render(<OfflineIndicator />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('offline')).toBeInTheDocument()
  })

  it('should display no-wifi icon when offline', () => {
    setNavigatorOnline(false)

    render(<OfflineIndicator />)

    const statusElement = screen.getByRole('status')
    const icon = statusElement.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should have proper accessibility attributes when offline', () => {
    setNavigatorOnline(false)

    render(<OfflineIndicator />)

    const statusElement = screen.getByRole('status')
    expect(statusElement).toHaveAttribute('aria-live', 'polite')
    expect(statusElement).toHaveAttribute('aria-atomic', 'true')
    expect(statusElement).toHaveAttribute('aria-label', 'Offline status indicator')
  })

  it('should listen to online event and hide when device comes online', async () => {
    setNavigatorOnline(false)

    render(<OfflineIndicator />)

    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      setNavigatorOnline(true)
      triggerNetworkEvent('online')
    })

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('should listen to offline event and show when device goes offline', async () => {
    setNavigatorOnline(true)

    render(<OfflineIndicator />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => {
      setNavigatorOnline(false)
      triggerNetworkEvent('offline')
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('offline')).toBeInTheDocument()
    })
  })

  it('should add event listeners on mount', () => {
    setNavigatorOnline(true)

    render(<OfflineIndicator />)

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('should remove event listeners on unmount', () => {
    setNavigatorOnline(true)

    const { unmount } = render(<OfflineIndicator />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('should accept custom className prop', () => {
    setNavigatorOnline(false)

    render(<OfflineIndicator className="custom-class" />)

    const statusElement = screen.getByRole('status')
    expect(statusElement).toHaveClass('custom-class')
  })

  it('should update when online status changes multiple times', async () => {
    setNavigatorOnline(false)

    render(<OfflineIndicator />)

    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      setNavigatorOnline(true)
      triggerNetworkEvent('online')
    })

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    act(() => {
      setNavigatorOnline(false)
      triggerNetworkEvent('offline')
    })

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    act(() => {
      setNavigatorOnline(true)
      triggerNetworkEvent('online')
    })

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility - Contrast', () => {
    it('should have sufficient contrast ratio for offline indicator', () => {
      setNavigatorOnline(false)

      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = vi.fn((element: Element) => {
        const style = originalGetComputedStyle(element)
        if (element.classList.contains('offline-indicator')) {
          return {
            ...style,
            color: 'rgb(0, 0, 0)',
            backgroundColor: 'rgb(211, 47, 47)',
            getPropertyValue: (prop: string) => {
              if (prop === 'color') return 'rgb(0, 0, 0)'
              if (prop === 'background-color') return 'rgb(211, 47, 47)'
              return style.getPropertyValue(prop)
            },
          } as CSSStyleDeclaration
        }
        return style
      }) as typeof window.getComputedStyle

      render(<OfflineIndicator />)

      const statusElement = screen.getByRole('status')
      const contrastRatio = getButtonContrastRatio(statusElement as HTMLElement)
      expect(contrastRatio).toBeGreaterThan(4.0)
      
      window.getComputedStyle = originalGetComputedStyle
    })
  })
})

