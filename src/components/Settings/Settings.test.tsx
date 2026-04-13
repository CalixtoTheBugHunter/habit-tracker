import type { ReactElement } from 'react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'
import type { LocaleCode } from '../../locale/types'
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

const SAMPLE_CHANGELOG = `# Changelog

See [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) for format.

## [0.1.0] - 2026-04-13

### Added

- Item one
`

const SAMPLE_CHANGELOG_PT = `# Registro de alterações

Veja [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-04-13

### Adicionado

- Item pt
`

describe('Settings', () => {
  beforeEach(() => {
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])
    vi.mocked(languageStorage.getPreferredLanguage).mockResolvedValue('en')
    vi.mocked(languageStorage.setPreferredLanguage).mockResolvedValue(undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => SAMPLE_CHANGELOG,
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function renderReady(
    ui: ReactElement,
    opts?: { initialLocale?: LocaleCode }
  ) {
    renderWithProviders(ui, opts)
    const settingsTitle = opts?.initialLocale === 'pt-BR' ? 'Configurações' : 'Settings'
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: settingsTitle })
      ).toBeInTheDocument()
    })
  }

  it('should render the settings title', async () => {
    await renderReady(<Settings onClose={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument()
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

  it('should show changelog content when Changelog is clicked', async () => {
    const user = userEvent.setup()
    await renderReady(<Settings onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: /Changelog/ }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Changelog', level: 1 })
      ).toBeInTheDocument()
    })

    const region = screen.getByRole('region', { name: 'Changelog' })
    await waitFor(() => {
      expect(
        within(region).getByRole('heading', { name: 'Added', level: 3 })
      ).toBeInTheDocument()
    })
    expect(within(region).getByText('Item one')).toBeInTheDocument()
    const externalLink = within(region).getByRole('link', {
      name: /Keep a Changelog/,
    })
    expect(externalLink).toHaveAttribute(
      'href',
      'https://keepachangelog.com/en/1.1.0/'
    )
    expect(externalLink).toHaveAccessibleName(/opens in new tab/i)
    expect(
      within(region).getByRole('heading', { name: 'Changelog', level: 2 })
    ).toBeInTheDocument()
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalled()
    const firstUrl = String(vi.mocked(globalThis.fetch).mock.calls[0]?.[0] ?? '')
    expect(firstUrl).toContain('CHANGELOG.md')
  })

  it('should fetch locale changelog when language is pt-BR', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => SAMPLE_CHANGELOG_PT,
      })
    )
    await renderReady(<Settings onClose={() => {}} />, {
      initialLocale: 'pt-BR',
    })

    await user.click(screen.getByRole('button', { name: /Atualizações/ }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Atualizações',
          level: 1,
        })
      ).toBeInTheDocument()
    })

    const firstUrl = String(vi.mocked(globalThis.fetch).mock.calls[0]?.[0] ?? '')
    expect(firstUrl).toContain('CHANGELOG.pt-BR.md')
    const region = screen.getByRole('region', { name: 'Atualizações' })
    await waitFor(() => {
      expect(within(region).getByText('Item pt')).toBeInTheDocument()
    })
  })

  it('should fall back to English changelog when locale file is missing', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: async () => '',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => SAMPLE_CHANGELOG,
        })
    )
    await renderReady(<Settings onClose={() => {}} />, {
      initialLocale: 'pt-BR',
    })

    await user.click(screen.getByRole('button', { name: /Atualizações/ }))

    await waitFor(() => {
      expect(
        within(screen.getByRole('region', { name: 'Atualizações' })).getByText(
          'Item one'
        )
      ).toBeInTheDocument()
    })

    const calls = vi.mocked(globalThis.fetch).mock.calls
    expect(String(calls[0]?.[0] ?? '')).toContain('CHANGELOG.pt-BR.md')
    expect(String(calls[1]?.[0] ?? '')).toContain('CHANGELOG.md')
  })

  it('should return to the list when back is clicked', async () => {
    const user = userEvent.setup()
    await renderReady(<Settings onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: /Changelog/ }))
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Changelog', level: 1 })
      ).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', { name: 'Back to settings list' })
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Changelog/ })).toBeInTheDocument()
  })

  it('should go back to list on Escape when on changelog, without closing', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    await renderReady(<Settings onClose={handleClose} />)

    await user.click(screen.getByRole('button', { name: /Changelog/ }))
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Changelog', level: 1 })
      ).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    })
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('should call onClose when Escape is pressed on the list', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    await renderReady(<Settings onClose={handleClose} />)

    await user.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close is clicked from changelog view', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    await renderReady(<Settings onClose={handleClose} />)

    await user.click(screen.getByRole('button', { name: /Changelog/ }))
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Changelog', level: 1 })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Close settings' }))

    expect(handleClose).toHaveBeenCalledTimes(1)
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

  it('should cycle Tab focus within settings on the changelog panel', async () => {
    const user = userEvent.setup()
    await renderReady(<Settings onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: /Changelog/ }))
    const region = screen.getByRole('region', { name: 'Changelog' })
    await waitFor(() => {
      expect(
        within(region).getByRole('link', { name: /Keep a Changelog/ })
      ).toBeInTheDocument()
    })

    const back = screen.getByRole('button', { name: 'Back to settings list' })
    const link = within(region).getByRole('link', { name: /Keep a Changelog/ })
    link.focus()
    await user.tab()
    expect(document.activeElement).toBe(back)
  })

  it('should show changelog load error when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => '',
      })
    )
    const user = userEvent.setup()
    await renderReady(<Settings onClose={() => {}} />)

    await user.click(screen.getByRole('button', { name: /Changelog/ }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Could not load changelog. Check your connection and try again.'
        )
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
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
