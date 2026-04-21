import { assertStrictSemver, compareSemver } from './semver.mjs'
import { bumpVersion } from './bump-version.mjs'

/**
 * @param {object} p
 * @param {string} p.bumpKind major | minor | patch | explicit
 * @param {string} [p.explicitVersion]
 * @param {string} p.currentFromPackage
 */
export function resolveNextVersion({
  bumpKind,
  explicitVersion = '',
  currentFromPackage,
}) {
  if (bumpKind === 'explicit') {
    const v = explicitVersion.trim()
    if (!v) {
      throw new Error('explicit_version is required when bump_kind is explicit')
    }
    assertStrictSemver(v)
    assertStrictSemver(currentFromPackage)
    if (compareSemver(v, currentFromPackage) <= 0) {
      throw new Error(
        `explicit_version must be greater than package.json version (${currentFromPackage}); got ${v}`
      )
    }
    return v
  }
  if (!['major', 'minor', 'patch'].includes(bumpKind)) {
    throw new Error(
      `bump_kind must be major, minor, patch, or explicit; got: ${bumpKind}`
    )
  }
  return bumpVersion(currentFromPackage, bumpKind)
}
