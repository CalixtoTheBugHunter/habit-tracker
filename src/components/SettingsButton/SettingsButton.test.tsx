import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsButton } from './SettingsButton'
import { verifyButtonContrast, mockComputedStyleForElement } from '../../test/utils/accessibility-helpers'

describe('SettingsButton', () => {
  it('should render a button element', () => {
    render(<SettingsButton onClick={() => {}} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should display a gear icon', () => {
    render(<SettingsButton onClick={() => {}} />)

    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should have accessible aria-label', () => {
    render(<SettingsButton onClick={() => {}} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open settings')
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<SettingsButton onClick={handleClick} />)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  describe('Accessibility - Contrast', () => {
    let cleanup: (() => void) | undefined

    afterEach(() => {
      if (cleanup) {
        cleanup()
        cleanup = undefined
      }
    })

    it('should have sufficient contrast ratio', () => {
      cleanup = mockComputedStyleForElement(
        'settings-button',
        'rgb(102, 102, 102)',
        'rgb(255, 255, 255)'
      )

      render(<SettingsButton onClick={() => {}} />)

      const button = screen.getByRole('button') as HTMLElement
      expect(verifyButtonContrast(button, 4.0)).toBe(true)
    })
  })
})
