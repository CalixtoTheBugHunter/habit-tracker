import type { ReactElement } from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'
import { verifyButtonContrast, mockComputedStyleForElement } from '../../test/utils/accessibility-helpers'
import { renderWithProviders } from '../../test/utils/render-helpers'
import * as languageStorage from '../../services/languageStorage'
import { openDB, getAllHabits } from '../../services/indexedDB'

vi.mock('../../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  addHabit: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
  testUtils: { resetDB: vi.fn() },
}))

describe('Settings', () => {
  beforeEach(() => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])
    vi.mocked(languageStorage.getPreferredLanguage).mockResolvedValue('en')
    vi.mocked(languageStorage.setPreferredLanguage).mockResolvedValue(undefined)
  })

  async function renderReady(ui: ReactElement) {
    renderWithProviders(ui)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    })
  }

  it('should render the settings title', async () => {
    await renderReady(<Settings onClose={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('should render a close button with aria-label', async () => {
    await renderReady(<Settings onClose={() => {}} />)

    const closeButton = screen.getByRole('button', { name: 'Close settings' })
    expect(closeButton).toBeInTheDocument()
  })

  it('should render the Changelog item', async () => {
    await renderReady(<Settings onClose={() => {}} />)

    expect(screen.getByRole('button', { name: /Changelog/ })).toBeInTheDocument()
  })

  it('should render preferred language select', async () => {
    await renderReady(<Settings onClose={() => {}} />)

    expect(screen.getByRole('combobox', { name: 'Preferred language' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Português' })).toBeInTheDocument()
  })

  it('should call setPreferredLanguage when language changes', async () => {
    const user = userEvent.setup()
    await renderReady(<Settings onClose={() => {}} />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Preferred language' }),
      'pt-BR'
    )

    expect(languageStorage.setPreferredLanguage).toHaveBeenCalledWith('pt-BR')
  })

  it('should render a navigation list', async () => {
    await renderReady(<Settings onClose={() => {}} />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    await renderReady(<Settings onClose={handleClose} />)

    await user.click(screen.getByRole('button', { name: 'Close settings' }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    await renderReady(<Settings onClose={handleClose} />)

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onNavigateToChangelog when Changelog item is clicked', async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn()

    await renderReady(
      <Settings onClose={() => {}} onNavigateToChangelog={handleNavigate} />
    )

    await user.click(screen.getByRole('button', { name: /Changelog/ }))

    expect(handleNavigate).toHaveBeenCalledTimes(1)
  })

  it('should not crash when Changelog is clicked without onNavigateToChangelog', async () => {
    const user = userEvent.setup()

    await renderReady(<Settings onClose={() => {}} />)

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

    it('should have sufficient contrast ratio on close button', async () => {
      cleanup = mockComputedStyleForElement(
        'settings__close-button',
        'rgb(102, 102, 102)',
        'rgb(245, 245, 245)'
      )

      await renderReady(<Settings onClose={() => {}} />)

      const closeButton = screen.getByRole('button', { name: 'Close settings' })
      expect(verifyButtonContrast(closeButton, 4.0)).toBe(true)
    })
  })
})
