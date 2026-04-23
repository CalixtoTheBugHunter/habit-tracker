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

describe('AppHeader', () => {
  it('should render logo', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={false} />)
    expect(screen.getByRole('heading', { name: /atomic habit tracker/i })).toBeInTheDocument()
  })

  it('should render menu button with open aria when closed', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={false} />)
    const button = screen.getByRole('button', { name: /open menu/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render menu button with close aria when open', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={true} />)
    const button = screen.getByRole('button', { name: /close menu/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('should call onMenuToggle when menu button is clicked', async () => {
    const user = userEvent.setup()
    const onMenuToggle = vi.fn()
    render(<AppHeader onMenuToggle={onMenuToggle} menuOpen={false} />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(onMenuToggle).toHaveBeenCalledTimes(1)
  })

  it('should render install prompt', () => {
    render(<AppHeader onMenuToggle={vi.fn()} menuOpen={false} />)
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument()
  })
})
