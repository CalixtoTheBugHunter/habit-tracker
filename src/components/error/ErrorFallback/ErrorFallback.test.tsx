import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorFallback } from './ErrorFallback'
import { AppError, IndexedDBError, ReactError } from '../../../utils/error/errorTypes'

describe('ErrorFallback', () => {
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
})

