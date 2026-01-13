import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorFallback } from './ErrorFallback'
import { AppError, IndexedDBError, ReactError } from '../../../utils/error/errorTypes'

describe('ErrorFallback', () => {
  beforeEach(() => {
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn() },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render error message', () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    render(<ErrorFallback error={error} />)

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    render(<ErrorFallback error={error} />)

    const container = screen.getByRole('alert')
    expect(container).toHaveAttribute('aria-live', 'assertive')
  })

  it('should display IndexedDBError message', () => {
    const error = new IndexedDBError(
      'INDEXEDDB_OPEN_FAILED',
      'Unable to access storage. Please refresh the page.'
    )
    render(<ErrorFallback error={error} />)

    expect(
      screen.getByText('Unable to access storage. Please refresh the page.')
    ).toBeInTheDocument()
  })

  it('should display ReactError message', () => {
    const error = new ReactError(
      'REACT_RENDER_ERROR',
      'Something went wrong. Please refresh the page.'
    )
    render(<ErrorFallback error={error} />)

    expect(
      screen.getByText('Something went wrong. Please refresh the page.')
    ).toBeInTheDocument()
  })

  it('should render reload button', () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    render(<ErrorFallback error={error} />)

    const button = screen.getByRole('button', { name: /reload page/i })
    expect(button).toBeInTheDocument()
  })

  it('should reload page when reload button is clicked', () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    render(<ErrorFallback error={error} />)

    const button = screen.getByRole('button', { name: /reload page/i })
    button.click()

    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('should focus the container when mounted', () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    render(<ErrorFallback error={error} />)

    const alertContainer = screen.getByRole('alert')
    expect(alertContainer).toHaveAttribute('tabIndex', '-1')
    expect(alertContainer).toBe(document.activeElement)
  })
})

