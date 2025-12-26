/**
 * Test utilities for IntersectionObserver mocking.
 */

import { vi } from 'vitest'

/**
 * Sets up a mock IntersectionObserver for testing.
 * 
 * This helper function creates a mock IntersectionObserver class that can be
 * used to test components that rely on IntersectionObserver for animations
 * or lazy loading behavior.
 * 
 * @returns The mock IntersectionObserver class that was assigned to window.IntersectionObserver
 */
export function setupIntersectionObserverMock(): typeof IntersectionObserver {
  const mockIntersectionObserver = class IntersectionObserver {
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
    takeRecords = vi.fn(() => [])
    root = null
    rootMargin = ''
    thresholds = []

    constructor(
      public callback: IntersectionObserverCallback,
      public options?: IntersectionObserverInit
    ) {}
  }

  window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
  return mockIntersectionObserver
}

/**
 * Tears down the IntersectionObserver mock.
 * 
 * This helper function removes the mock IntersectionObserver from the window
 * object, restoring the original state after tests.
 */
export function teardownIntersectionObserverMock(): void {
  delete (window as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver
}

