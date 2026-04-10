import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('../services/languageStorage', () => ({
  getPreferredLanguage: vi.fn(() => Promise.resolve('en')),
  setPreferredLanguage: vi.fn(() => Promise.resolve()),
}))

