import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'
import { verifyButtonContrast, mockComputedStyleForElement } from '../../test/utils/accessibility-helpers'

describe('Settings', () => {
  it('should render the settings title', () => {
    render(<Settings onClose={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('should render a close button with aria-label', () => {
    render(<Settings onClose={() => {}} />)

    const closeButton = screen.getByRole('button', { name: 'Close settings' })
    expect(closeButton).toBeInTheDocument()
  })

  it('should render the Changelog item', () => {
    render(<Settings onClose={() => {}} />)

    expect(screen.getByRole('button', { name: /Changelog/ })).toBeInTheDocument()
  })

  it('should render a navigation list', () => {
    render(<Settings onClose={() => {}} />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(<Settings onClose={handleClose} />)

    await user.click(screen.getByRole('button', { name: 'Close settings' }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(<Settings onClose={handleClose} />)

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onNavigateToChangelog when Changelog item is clicked', async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn()

    render(<Settings onClose={() => {}} onNavigateToChangelog={handleNavigate} />)

    await user.click(screen.getByRole('button', { name: /Changelog/ }))

    expect(handleNavigate).toHaveBeenCalledTimes(1)
  })

  it('should not crash when Changelog is clicked without onNavigateToChangelog', async () => {
    const user = userEvent.setup()

    render(<Settings onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: /Changelog/ }))
  })

  describe('Accessibility - Contrast', () => {
    let cleanup: (() => void) | undefined

    afterEach(() => {
      if (cleanup) {
        cleanup()
        cleanup = undefined
      }
    })

    it('should have sufficient contrast ratio on close button', () => {
      cleanup = mockComputedStyleForElement(
        'settings__close-button',
        'rgb(102, 102, 102)',
        'rgb(245, 245, 245)'
      )

      render(<Settings onClose={() => {}} />)

      const closeButton = screen.getByRole('button', { name: 'Close settings' })
      expect(verifyButtonContrast(closeButton, 4.0)).toBe(true)
    })
  })
})
