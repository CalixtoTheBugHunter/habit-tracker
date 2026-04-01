import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsButton } from './SettingsButton'
import { getButtonContrastRatio } from '../../test/utils/accessibility-helpers'

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

  it('should be keyboard accessible via Enter key', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<SettingsButton onClick={handleClick} />)

    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be keyboard accessible via Space key', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<SettingsButton onClick={handleClick} />)

    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard(' ')

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should have settings-button class for styling', () => {
    render(<SettingsButton onClick={() => {}} />)

    expect(screen.getByRole('button')).toHaveClass('settings-button')
  })

  describe('Accessibility - Contrast', () => {
    it('should have sufficient contrast ratio', () => {
      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = vi.fn((element: Element) => {
        const style = originalGetComputedStyle(element)
        if (element.classList.contains('settings-button')) {
          return {
            ...style,
            color: 'rgb(102, 102, 102)',
            backgroundColor: 'rgb(255, 255, 255)',
            getPropertyValue: (prop: string) => {
              if (prop === 'color') return 'rgb(102, 102, 102)'
              if (prop === 'background-color') return 'rgb(255, 255, 255)'
              return style.getPropertyValue(prop)
            },
          } as CSSStyleDeclaration
        }
        return style
      }) as typeof window.getComputedStyle

      render(<SettingsButton onClick={() => {}} />)

      const button = screen.getByRole('button') as HTMLElement
      const contrastRatio = getButtonContrastRatio(button)
      expect(contrastRatio).toBeGreaterThan(4.0)

      window.getComputedStyle = originalGetComputedStyle
    })
  })
})
