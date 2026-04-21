import { describe, it, expect } from 'vitest'
import { resolveNextVersion } from './resolve-next-version.mjs'

describe('resolveNextVersion', () => {
  it('explicit', () => {
    expect(
      resolveNextVersion({
        bumpKind: 'explicit',
        explicitVersion: ' 2.0.0 ',
        currentFromPackage: '1.0.0',
      })
    ).toBe('2.0.0')
  })

  it('explicit requires version', () => {
    expect(() =>
      resolveNextVersion({
        bumpKind: 'explicit',
        explicitVersion: '',
        currentFromPackage: '1.0.0',
      })
    ).toThrow(/explicit_version/)
  })

  it('patch from current', () => {
    expect(
      resolveNextVersion({
        bumpKind: 'patch',
        explicitVersion: '',
        currentFromPackage: '0.4.0',
      })
    ).toBe('0.4.1')
  })

  it('rejects invalid bump_kind', () => {
    expect(() =>
      resolveNextVersion({
        bumpKind: 'nope',
        explicitVersion: '',
        currentFromPackage: '1.0.0',
      })
    ).toThrow(/bump_kind/)
  })

  it('rejects invalid explicit semver', () => {
    expect(() =>
      resolveNextVersion({
        bumpKind: 'explicit',
        explicitVersion: '1.0',
        currentFromPackage: '1.0.0',
      })
    ).toThrow(/Invalid semver/)
  })

  it('explicit must be greater than package version', () => {
    expect(() =>
      resolveNextVersion({
        bumpKind: 'explicit',
        explicitVersion: '1.0.0',
        currentFromPackage: '2.0.0',
      })
    ).toThrow(/greater than package/)
  })

  it('explicit cannot equal package version', () => {
    expect(() =>
      resolveNextVersion({
        bumpKind: 'explicit',
        explicitVersion: '1.0.0',
        currentFromPackage: '1.0.0',
      })
    ).toThrow(/greater than package/)
  })

  it('rejects explicit when current package version is invalid semver', () => {
    expect(() =>
      resolveNextVersion({
        bumpKind: 'explicit',
        explicitVersion: '2.0.0',
        currentFromPackage: 'v1.0.0',
      })
    ).toThrow(/Invalid semver/)
  })
})
