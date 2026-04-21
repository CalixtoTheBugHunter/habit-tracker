const ALLOWED_LOCALES = ['en', 'pt-BR']

/**
 * Ensures `changelog-files.json` matches what the release script supports.
 * @param {unknown} manifest
 */
export function assertReleaseChangelogManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error(
      'changelog-files.json must be a JSON object mapping locale codes to changelog paths'
    )
  }
  /** @type {Record<string, string>} */
  const m = manifest
  const unknown = Object.keys(m).filter((k) => !ALLOWED_LOCALES.includes(k))
  if (unknown.length) {
    throw new Error(
      `changelog-files.json contains unsupported locale(s): ${unknown.join(', ')}. Extend scripts/release/apply-release.mjs or remove the entries before running a release.`
    )
  }
  for (const locale of ALLOWED_LOCALES) {
    const p = m[locale]
    if (typeof p !== 'string' || !p.trim()) {
      throw new Error(
        `changelog-files.json must include a non-empty "${locale}" changelog path`
      )
    }
  }
}
