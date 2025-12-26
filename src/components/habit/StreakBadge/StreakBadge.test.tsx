import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreakBadge } from './StreakBadge'
import {
  setupIntersectionObserverMock,
  teardownIntersectionObserverMock,
} from '../../../test/utils/intersection-observer-test-helpers'

describe('StreakBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupIntersectionObserverMock()
  })

  afterEach(() => {
    teardownIntersectionObserverMock()
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

  it.each([
    { streak: 1, expectedClass: 'streak-badge-simple', notExpectedClass: 'streak-badge-colorful' },
    { streak: 3, expectedClass: 'streak-badge-simple', notExpectedClass: 'streak-badge-colorful' },
    { streak: 7, expectedClass: 'streak-badge-simple', notExpectedClass: 'streak-badge-colorful' },
    { streak: 8, expectedClass: 'streak-badge-colorful', notExpectedClass: 'streak-badge-simple' },
    { streak: 15, expectedClass: 'streak-badge-colorful', notExpectedClass: 'streak-badge-simple' },
  ])('should apply $expectedClass styling for streak $streak', ({ streak, expectedClass, notExpectedClass }) => {
    const { container } = render(<StreakBadge streak={streak} />)
    const badge = container.querySelector('.streak-badge')
    expect(badge).toHaveClass(expectedClass)
    expect(badge).not.toHaveClass(notExpectedClass)
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

