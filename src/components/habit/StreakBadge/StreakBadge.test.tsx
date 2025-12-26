import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakBadge } from './StreakBadge'

describe('StreakBadge', () => {
  let mockIntersectionObserver: typeof IntersectionObserver

  beforeEach(() => {
    vi.clearAllMocks()

    mockIntersectionObserver = class IntersectionObserver {
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
      root = null
      rootMargin = ''
      thresholds = []

      constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit
      ) {}
    }

    global.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    delete (global as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver
  })

  it('should return null when streak is 0', () => {
    const { container } = render(<StreakBadge streak={0} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render badge when streak is greater than 0', () => {
    render(<StreakBadge streak={1} />)
    expect(screen.getByText('1-day streak')).toBeInTheDocument()
  })

  it('should display correct text format for streak', () => {
    render(<StreakBadge streak={5} />)
    expect(screen.getByText('5-day streak')).toBeInTheDocument()
  })

  it('should apply simple styling for streaks 1-7', () => {
    const { container } = render(<StreakBadge streak={3} />)
    const badge = container.querySelector('.streak-badge')
    expect(badge).toHaveClass('streak-badge-simple')
    expect(badge).not.toHaveClass('streak-badge-colorful')
  })

  it('should apply simple styling for streak 7', () => {
    const { container } = render(<StreakBadge streak={7} />)
    const badge = container.querySelector('.streak-badge')
    expect(badge).toHaveClass('streak-badge-simple')
    expect(badge).not.toHaveClass('streak-badge-colorful')
  })

  it('should apply colorful styling for streaks greater than 7', () => {
    const { container } = render(<StreakBadge streak={8} />)
    const badge = container.querySelector('.streak-badge')
    expect(badge).toHaveClass('streak-badge-colorful')
    expect(badge).not.toHaveClass('streak-badge-simple')
  })

  it('should have correct aria-label', () => {
    render(<StreakBadge streak={5} />)
    const badge = screen.getByLabelText('5-day streak')
    expect(badge).toBeInTheDocument()
  })

  it('should have correct aria-label for long streaks', () => {
    render(<StreakBadge streak={30} />)
    const badge = screen.getByLabelText('30-day streak')
    expect(badge).toBeInTheDocument()
  })
})

