/**
 * Strict MAJOR.MINOR.PATCH (no prerelease/build metadata).
 * @param {string} str
 */
export function assertStrictSemver(str) {
  if (
    typeof str !== 'string' ||
    !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(str)
  ) {
    throw new Error(`Invalid semver (expected MAJOR.MINOR.PATCH): ${str}`)
  }
}

/**
 * @param {string} str
 * @returns {{ major: number, minor: number, patch: number }}
 */
export function parseSemver(str) {
  assertStrictSemver(str)
  const [major, minor, patch] = str.split('.').map((n) => Number(n))
  return { major, minor, patch }
}

/**
 * Compare two strict MAJOR.MINOR.PATCH strings.
 * @returns {-1 | 0 | 1} negative if a < b, zero if equal, positive if a > b
 */
export function compareSemver(a, b) {
  const pa = parseSemver(a)
  const pb = parseSemver(b)
  if (pa.major !== pb.major) return pa.major > pb.major ? 1 : -1
  if (pa.minor !== pb.minor) return pa.minor > pb.minor ? 1 : -1
  if (pa.patch !== pb.patch) return pa.patch > pb.patch ? 1 : -1
  return 0
}
