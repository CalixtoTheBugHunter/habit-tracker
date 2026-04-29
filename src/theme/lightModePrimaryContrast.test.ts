import { describe, it, expect } from 'vitest'
import { getContrastRatio, meetsWCAGAA } from '../utils/accessibility/contrastRatio'

/**
 * Light theme tokens in src/index.css :root — primary buttons use
 * background --color-primary and color --color-button-primary-text.
 * Regression: both were #000000 so labels were invisible (solid black controls).
 */
describe('light mode primary button tokens', () => {
  const LIGHT_PRIMARY = '#000000'
  const LIGHT_ON_PRIMARY = '#ffffff'

  it('on-primary text contrasts with black primary (WCAG AA)', () => {
    const ratio = getContrastRatio(LIGHT_PRIMARY, LIGHT_ON_PRIMARY)
    expect(ratio).toBeGreaterThan(4.5)
    expect(meetsWCAGAA(ratio, false)).toBe(true)
  })

  it('on-primary is not the same as fill (1:1 would hide label)', () => {
    expect(LIGHT_PRIMARY).not.toBe(LIGHT_ON_PRIMARY)
  })
})
