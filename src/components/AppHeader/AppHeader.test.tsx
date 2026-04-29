import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppHeader } from './AppHeader'
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

vi.mock('../pwa/InstallPrompt/InstallPrompt', () => ({
  InstallPrompt: () => <div data-testid="install-prompt" />,
}))

const defaultHomeProps = {
  onHomeClick: vi.fn(),
  homeIsActive: false,
}

describe('AppHeader', () => {
  it('should render logo as home link with app title as accessible name', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={false} {...defaultHomeProps} />)
    const link = screen.getByRole('link', { name: /atomic habit tracker/i })
    expect(link).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toContainElement(link)
  })

  it('should set aria-current=page on home link when home is active', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={false} onHomeClick={vi.fn()} homeIsActive />)
    expect(screen.getByRole('link', { name: /atomic habit tracker/i })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('should not set aria-current on home link when home is not active', () => {
    render(
      <AppHeader onMenuToggle={vi.fn()} menuOpen={false} onHomeClick={vi.fn()} homeIsActive={false} />
    )
    expect(screen.getByRole('link', { name: /atomic habit tracker/i })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('should call onHomeClick when logo link is activated', async () => {
    const user = userEvent.setup()
    const onHomeClick = vi.fn()
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={false} onHomeClick={onHomeClick} homeIsActive={false} />)
    await user.click(screen.getByRole('link', { name: /atomic habit tracker/i }))
    expect(onHomeClick).toHaveBeenCalledTimes(1)
  })

  it('should render menu button with open aria when closed', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={false} {...defaultHomeProps} />)
    const button = screen.getByRole('button', { name: /open menu/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render menu button with close aria when open', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={true} {...defaultHomeProps} />)
    const button = screen.getByRole('button', { name: /close menu/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should call onMenuToggle when menu button is clicked', async () => {
    const user = userEvent.setup()
    const onMenuToggle = vi.fn()
    render(<AppHeader onMenuToggle={onMenuToggle} menuOpen={false} {...defaultHomeProps} />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(onMenuToggle).toHaveBeenCalledTimes(1)
  })

  it('should render install prompt', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={false} {...defaultHomeProps} />)
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument()
  })
})
