import { describe, it, expect } from 'vitest'
import { assertStrictSemver, parseSemver } from './semver.mjs'

describe('semver', () => {
  it('parseSemver parses 1.0.0', () => {
    expect(parseSemver('1.0.0')).toEqual({ major: 1, minor: 0, patch: 0 })
  })

  it('rejects leading zeros', () => {
    expect(() => assertStrictSemver('01.0.0')).toThrow(/Invalid semver/)
  })

  it('rejects v prefix', () => {
    expect(() => assertStrictSemver('v1.0.0')).toThrow(/Invalid semver/)
  })

  it('rejects two segments', () => {
    expect(() => assertStrictSemver('1.0')).toThrow(/Invalid semver/)
  })

  it('rejects prerelease', () => {
    expect(() => assertStrictSemver('1.0.0-beta')).toThrow(/Invalid semver/)
  })
})
