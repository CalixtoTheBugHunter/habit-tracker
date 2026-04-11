import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as languageStorage from '../services/languageStorage'
import { LanguageProvider, useLanguage } from './LanguageContext'

function LocaleConsumer() {
  const { locale, messages, setLanguage } = useLanguage()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="title">{messages.app.title}</span>
      <button type="button" onClick={() => void setLanguage('pt-BR')}>
        use-pt
      </button>
    </div>
  )
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    vi.mocked(languageStorage.getPreferredLanguage).mockResolvedValue('en')
    vi.mocked(languageStorage.setPreferredLanguage).mockResolvedValue(undefined)
  })

  it('loads stored preference without persisting again', async () => {
    vi.mocked(languageStorage.getPreferredLanguage).mockResolvedValue('pt-BR')

    render(
      <LanguageProvider>
        <LocaleConsumer />
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('locale')).toHaveTextContent('pt-BR')
    })
    expect(languageStorage.setPreferredLanguage).not.toHaveBeenCalled()
  })

  it('persists device default on first visit when nothing stored', async () => {
    vi.mocked(languageStorage.getPreferredLanguage).mockResolvedValue(undefined)

    render(
      <LanguageProvider>
        <LocaleConsumer />
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(languageStorage.setPreferredLanguage).toHaveBeenCalled()
    })
  })

  it('setLanguage updates locale and persists', async () => {
    const user = userEvent.setup()
    vi.mocked(languageStorage.getPreferredLanguage).mockResolvedValue('en')

    render(
      <LanguageProvider>
        <LocaleConsumer />
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('locale')).toHaveTextContent('en')
    })

    await user.click(screen.getByRole('button', { name: 'use-pt' }))

    await waitFor(() => {
      expect(screen.getByTestId('locale')).toHaveTextContent('pt-BR')
    })
    expect(languageStorage.setPreferredLanguage).toHaveBeenCalledWith('pt-BR')
  })
})
