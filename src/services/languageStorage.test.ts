import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSetting, setSetting } = vi.hoisted(() => ({
  getSetting: vi.fn(),
  setSetting: vi.fn(),
}))

vi.mock('./indexedDB', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./indexedDB')>()
  return {
    ...actual,
    getSetting,
    setSetting,
  }
})

vi.unmock('./languageStorage')

import { getPreferredLanguage, setPreferredLanguage } from './languageStorage'

describe('languageStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns undefined when no preference is stored', async () => {
    getSetting.mockResolvedValue(undefined)
    await expect(getPreferredLanguage()).resolves.toBeUndefined()
    expect(getSetting).toHaveBeenCalledWith('preferredLanguage')
  })

  it('returns locale when stored value is supported', async () => {
    getSetting.mockResolvedValue('pt-BR')
    await expect(getPreferredLanguage()).resolves.toBe('pt-BR')
  })

  it('returns undefined when stored value is not supported', async () => {
    getSetting.mockResolvedValue('fr')
    await expect(getPreferredLanguage()).resolves.toBeUndefined()
  })

  it('persists supported locale via setPreferredLanguage', async () => {
    setSetting.mockResolvedValue(undefined)
    await setPreferredLanguage('en')
    expect(setSetting).toHaveBeenCalledWith('preferredLanguage', 'en')
  })

  it('does not persist unsupported locale', async () => {
    // @ts-expect-error deliberate invalid code for runtime guard
    await setPreferredLanguage('fr')
    expect(setSetting).not.toHaveBeenCalled()
  })
})
