import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { getContrastRatio, meetsWCAGAA } from '../utils/accessibility/contrastRatio'

/**
 * Regression: light-theme primary button background and on-primary text were
 * both #000000, making button labels invisible. Parse the actual CSS tokens so
 * a future token change can't silently reintroduce the bug.
 */
describe('light mode primary button tokens', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const indexCss = readFileSync(resolve(here, '../index.css'), 'utf-8')

  const rootBlock = indexCss.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? ''

  function readVar(name: string): string {
    const match = rootBlock.match(new RegExp(`--${name}:\\s*([^;]+);`))
    const value = match?.[1]
    if (!value) throw new Error(`Could not find --${name} in :root block`)
    return value.trim()
  }

  const lightPrimary = readVar('color-primary')
  const lightOnPrimary = readVar('color-button-primary-text')

  it('on-primary text contrasts with primary (WCAG AA)', () => {
    const ratio = getContrastRatio(lightPrimary, lightOnPrimary)
    expect(ratio).toBeGreaterThan(4.5)
    expect(meetsWCAGAA(ratio, false)).toBe(true)
  })

  it('on-primary is not the same as the fill (1:1 would hide the label)', () => {
    expect(lightPrimary.toLowerCase()).not.toBe(lightOnPrimary.toLowerCase())
  })
})
