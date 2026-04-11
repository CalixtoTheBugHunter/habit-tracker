import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { LanguageProvider } from '../../contexts/LanguageContext'

/** Renders UI with synchronous English locale (matches test `LanguageProvider initialLocale`). */
export function renderWithLangReady(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(
    <LanguageProvider initialLocale="en">{ui}</LanguageProvider>,
    options
  )
}
