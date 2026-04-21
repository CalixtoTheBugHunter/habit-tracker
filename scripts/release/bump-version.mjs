import { parseSemver } from './semver.mjs'

/**
 * @param {string} current
 * @param {'major' | 'minor' | 'patch'} kind
 */
export function bumpVersion(current, kind) {
  const { major, minor, patch } = parseSemver(current)
  if (kind === 'major') return `${major + 1}.0.0`
  if (kind === 'minor') return `${major}.${minor + 1}.0`
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`
  throw new Error(`Unknown bump kind: ${kind}`)
}
