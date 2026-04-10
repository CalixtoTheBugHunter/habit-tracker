import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsButton } from './SettingsButton'
import { verifyButtonContrast, mockComputedStyleForElement } from '../../test/utils/accessibility-helpers'
import { renderWithLangReady } from '../../test/utils/renderWithLangReady'

describe('SettingsButton', () => {
  it('should render a button element', async () => {
    await renderWithLangReady(<SettingsButton onClick={() => {}} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should display a gear icon', async () => {
    await renderWithLangReady(<SettingsButton onClick={() => {}} />)

    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('should have accessible aria-label', async () => {
    await renderWithLangReady(<SettingsButton onClick={() => {}} />)

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Open settings'
    )
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    await renderWithLangReady(<SettingsButton onClick={handleClick} />)

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

    it('should have sufficient contrast ratio', async () => {
      cleanup = mockComputedStyleForElement(
        'settings-button',
        'rgb(102, 102, 102)',
        'rgb(255, 255, 255)'
      )

      await renderWithLangReady(<SettingsButton onClick={() => {}} />)

      const button = screen.getByRole('button') as HTMLElement
      expect(verifyButtonContrast(button, 4.0)).toBe(true)
    })
  })
})
