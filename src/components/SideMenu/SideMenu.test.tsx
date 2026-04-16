import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SideMenu } from './SideMenu'
import * as localeModule from '../../locale'
import { supportedLanguages } from '../../config/supportedLanguages'

vi.mock('../../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useLanguage: () => ({
    locale: 'en' as const,
    messages: localeModule.getMessagesForLocale('en'),
    setLanguage: vi.fn(),
    supportedLanguages,
    isReady: true,
  }),
}))

describe('SideMenu', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    activeView: 'home' as const,
    onNavigate: vi.fn(),
  }

  it('should render navigation with correct aria-label', () => {
    render(<SideMenu {...defaultProps} />)
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
  })

  it('should render all nav items', () => {
    render(<SideMenu {...defaultProps} />)
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /statistics/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
  })

  it('should highlight active view', () => {
    render(<SideMenu {...defaultProps} activeView="statistics" />)
    const statsButton = screen.getByRole('button', { name: /statistics/i })
    expect(statsButton).toHaveAttribute('aria-current', 'page')
    expect(statsButton).toHaveClass('side-menu__item--active')
  })

  it('should not highlight inactive views', () => {
    render(<SideMenu {...defaultProps} activeView="home" />)
    const statsButton = screen.getByRole('button', { name: /statistics/i })
    expect(statsButton).not.toHaveAttribute('aria-current')
    expect(statsButton).not.toHaveClass('side-menu__item--active')
  })

  it('should call onNavigate and onClose when nav item is clicked', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onClose = vi.fn()
    render(<SideMenu {...defaultProps} onNavigate={onNavigate} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /statistics/i }))
    expect(onNavigate).toHaveBeenCalledWith('statistics')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should render backdrop when open', () => {
    const { container } = render(<SideMenu {...defaultProps} isOpen={true} />)
    expect(container.querySelector('.side-menu__backdrop')).toBeInTheDocument()
  })

  it('should not render backdrop when closed', () => {
    const { container } = render(<SideMenu {...defaultProps} isOpen={false} />)
    expect(container.querySelector('.side-menu__backdrop')).not.toBeInTheDocument()
  })

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = render(<SideMenu {...defaultProps} onClose={onClose} />)

    const backdrop = container.querySelector('.side-menu__backdrop')
    expect(backdrop).toBeInTheDocument()
    await user.click(backdrop!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should have aria-hidden false when open', () => {
    render(<SideMenu {...defaultProps} isOpen={true} />)
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(nav).toHaveAttribute('aria-hidden', 'false')
  })

  it('should apply open class when isOpen is true', () => {
    render(<SideMenu {...defaultProps} isOpen={true} />)
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(nav).toHaveClass('side-menu--open')
  })

  it('should not apply open class when isOpen is false', () => {
    const { container } = render(<SideMenu {...defaultProps} isOpen={false} />)
    const nav = container.querySelector('.side-menu')
    expect(nav).not.toHaveClass('side-menu--open')
  })

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<SideMenu {...defaultProps} onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose on Escape when closed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<SideMenu {...defaultProps} isOpen={false} onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should focus first nav item when opened', () => {
    render(<SideMenu {...defaultProps} isOpen={true} />)
    const firstButton = screen.getByRole('button', { name: /home/i })
    expect(document.activeElement).toBe(firstButton)
  })

  it('should trap focus within the menu on Tab', async () => {
    const user = userEvent.setup()
    render(<SideMenu {...defaultProps} isOpen={true} />)

    const buttons = screen.getAllByRole('button')
    const firstButton = buttons[0]!
    const lastButton = buttons[buttons.length - 1]!

    // Focus should start on first button
    expect(document.activeElement).toBe(firstButton)

    // Tab from last button should wrap to first
    lastButton.focus()
    await user.tab()
    expect(document.activeElement).toBe(firstButton)
  })

  it('should trap focus within the menu on Shift+Tab', async () => {
    const user = userEvent.setup()
    render(<SideMenu {...defaultProps} isOpen={true} />)

    const buttons = screen.getAllByRole('button')
    const firstButton = buttons[0]!
    const lastButton = buttons[buttons.length - 1]!

    // Shift+Tab from first button should wrap to last
    firstButton.focus()
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(lastButton)
  })
})
