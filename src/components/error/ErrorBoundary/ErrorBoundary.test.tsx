import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'
import { ReactError } from '../../../utils/error/errorTypes'
import { logError } from '../../../utils/error/errorLogger'

vi.mock('../../../utils/error/errorLogger', () => ({
  logError: vi.fn(),
}))

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear()
    }
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should catch errors and display ErrorFallback', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(
      screen.getByText('Something went wrong. Please refresh the page.')
    ).toBeInTheDocument()
  })

  it('should log error when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(logError).toHaveBeenCalled()
    const callArgs = vi.mocked(logError).mock.calls[0]
    expect(callArgs?.[0]).toBeInstanceOf(ReactError)
    expect(callArgs?.[0].code).toBe('REACT_RENDER_ERROR')
  })

  it('should include component stack in error context', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(logError).toHaveBeenCalled()
    const callArgs = vi.mocked(logError).mock.calls[0]
    expect(callArgs?.[1]).toHaveProperty('componentStack')
  })

  it('should convert non-Error exceptions to ReactError', () => {
    const ThrowString = () => {
      throw 'String error'
    }

    render(
      <ErrorBoundary>
        <ThrowString />
      </ErrorBoundary>
    )

    expect(logError).toHaveBeenCalled()
    const callArgs = vi.mocked(logError).mock.calls[0]
    expect(callArgs?.[0]).toBeInstanceOf(ReactError)
    expect(callArgs?.[0].userMessage).toBe('Something went wrong. Please refresh the page.')
  })

  it('should store error in sessionStorage', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Verify logError was called, which will store the error
    // (storage integration is tested separately in errorLogger.test.ts)
    expect(logError).toHaveBeenCalled()
    const callArgs = vi.mocked(logError).mock.calls[0]
    expect(callArgs?.[0].code).toBe('REACT_RENDER_ERROR')
  })

  it('should handle multiple errors', () => {
    const ThrowError1 = () => {
      throw new Error('Error 1')
    }
    const ThrowError2 = () => {
      throw new Error('Error 2')
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError1 />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong. Please refresh the page.')).toBeInTheDocument()

    rerender(
      <ErrorBoundary>
        <ThrowError2 />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong. Please refresh the page.')).toBeInTheDocument()
  })
})

