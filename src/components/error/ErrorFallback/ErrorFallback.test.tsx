import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { ErrorFallback } from './ErrorFallback'
import { AppError, IndexedDBError, ReactError } from '../../../utils/error/errorTypes'
import { renderWithLangReady } from '../../../test/utils/renderWithLangReady'

describe('ErrorFallback', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn() },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render error message', async () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    await renderWithLangReady(<ErrorFallback error={error} />)

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', async () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    await renderWithLangReady(<ErrorFallback error={error} />)

    const container = screen.getByRole('alert')
    expect(container).toHaveAttribute('aria-live', 'assertive')
  })

  it('should display IndexedDBError message', async () => {
    const error = new IndexedDBError(
      'INDEXEDDB_OPEN_FAILED',
      'Unable to access storage. Please refresh the page.'
    )
    await renderWithLangReady(<ErrorFallback error={error} />)

    expect(
      screen.getByText('Unable to access storage. Please refresh the page.')
    ).toBeInTheDocument()
  })

  it('should display ReactError message', async () => {
    const error = new ReactError(
      'REACT_RENDER_ERROR',
      'Something went wrong. Please refresh the page.'
    )
    await renderWithLangReady(<ErrorFallback error={error} />)

    expect(
      screen.getByText('Something went wrong. Please refresh the page.')
    ).toBeInTheDocument()
  })

  it('should render reload button', async () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    await renderWithLangReady(<ErrorFallback error={error} />)

    const button = screen.getByRole('button', { name: /reload page/i })
    expect(button).toBeInTheDocument()
  })

  it('should reload page when reload button is clicked', async () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    await renderWithLangReady(<ErrorFallback error={error} />)

    const button = screen.getByRole('button', { name: /reload page/i })
    button.click()

    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('should focus the container when mounted', async () => {
    const error = new AppError('UNKNOWN_ERROR', 'Test error message')
    await renderWithLangReady(<ErrorFallback error={error} />)

    const alertContainer = screen.getByRole('alert')
    expect(alertContainer).toHaveAttribute('tabIndex', '-1')
    expect(alertContainer).toBe(document.activeElement)
  })
})
