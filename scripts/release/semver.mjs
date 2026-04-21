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
