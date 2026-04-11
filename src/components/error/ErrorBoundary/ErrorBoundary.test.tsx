import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'
import { LanguageProvider } from '../../../contexts/LanguageContext'
import { ReactError } from '../../../utils/error/errorTypes'
import { logError } from '../../../utils/error/errorLogger'
import { renderWithLangReady } from '../../../test/utils/renderWithLangReady'

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

  it('should render children when there is no error', async () => {
    await renderWithLangReady(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should catch errors and display ErrorFallback', async () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    await renderWithLangReady(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong. Please refresh the page.')
      ).toBeInTheDocument()
    })
  })

  it('should log error when error occurs', async () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    await renderWithLangReady(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(logError).toHaveBeenCalled()
    })
    const callArgs = vi.mocked(logError).mock.calls[0]
    expect(callArgs?.[0]).toBeInstanceOf(ReactError)
    expect(callArgs?.[0].code).toBe('REACT_RENDER_ERROR')
  })

  it('should include component stack in error context', async () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    await renderWithLangReady(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(logError).toHaveBeenCalled()
    })
    const callArgs = vi.mocked(logError).mock.calls[0]
    expect(callArgs?.[1]).toHaveProperty('componentStack')
  })

  it('should convert non-Error exceptions to ReactError', async () => {
    const ThrowString = () => {
      throw 'String error'
    }

    await renderWithLangReady(
      <ErrorBoundary>
        <ThrowString />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(logError).toHaveBeenCalled()
    })
    const callArgs = vi.mocked(logError).mock.calls[0]
    expect(callArgs?.[0]).toBeInstanceOf(ReactError)
    expect(callArgs?.[0].userMessage).toBe(
      'Something went wrong. Please refresh the page.'
    )
  })

  it('should store error in sessionStorage', async () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    await renderWithLangReady(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(logError).toHaveBeenCalled()
    })
    const callArgs = vi.mocked(logError).mock.calls[0]
    expect(callArgs?.[0].code).toBe('REACT_RENDER_ERROR')
  })

  it('should handle multiple errors', async () => {
    const ThrowError1 = () => {
      throw new Error('Error 1')
    }
    const ThrowError2 = () => {
      throw new Error('Error 2')
    }

    const { rerender } = await renderWithLangReady(
      <ErrorBoundary>
        <ThrowError1 />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong. Please refresh the page.')
      ).toBeInTheDocument()
    })

    rerender(
      <LanguageProvider>
        <ErrorBoundary>
          <ThrowError2 />
        </ErrorBoundary>
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong. Please refresh the page.')
      ).toBeInTheDocument()
    })
  })
})
