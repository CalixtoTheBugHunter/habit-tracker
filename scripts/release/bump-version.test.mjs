import { describe, it, expect } from 'vitest'
import { bumpVersion } from './bump-version.mjs'

describe('bumpVersion', () => {
  it('patch', () => {
    expect(bumpVersion('0.4.0', 'patch')).toBe('0.4.1')
  })

  it('minor', () => {
    expect(bumpVersion('0.4.9', 'minor')).toBe('0.5.0')
  })

  it('major', () => {
    expect(bumpVersion('0.4.0', 'major')).toBe('1.0.0')
  })

  it('major from 9.9.9', () => {
    expect(bumpVersion('9.9.9', 'major')).toBe('10.0.0')
  })
})
