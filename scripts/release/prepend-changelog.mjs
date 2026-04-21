/**
 * @param {string} content
 * @returns {string | null} version inside first `## [version]` line, or null
 */
export function firstChangelogReleaseVersion(content) {
  const lines = content.split(/\r?\n/)
  for (const line of lines) {
    if (line.startsWith('## [') && !line.startsWith('###')) {
      const m = line.match(/^## \[([^\]]+)\]/)
      return m ? m[1] : null
    }
  }
  return null
}

/**
 * @param {object} opts
 * @param {string} opts.fileContent
 * @param {string} opts.version
 * @param {string} opts.dateIso YYYY-MM-DD
 * @param {'en' | 'pt-BR'} opts.locale
 * @param {string[]} opts.bulletLines
 */
export function prependReleaseSection({
  fileContent,
  version,
  dateIso,
  locale,
  bulletLines,
}) {
  const lines = fileContent.split(/\r?\n/)
  let insertIdx = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('## [') && !line.startsWith('###')) {
      insertIdx = i
      break
    }
  }
  if (insertIdx === -1) {
    throw new Error('No top-level ## [version] heading found in changelog')
  }

  const subsection = locale === 'pt-BR' ? '### Adicionado' : '### Added'
  const bulletsNormalized = bulletLines.map((line) => {
    const t = line.trim()
    if (!t) return null
    if (!t.startsWith('-')) return `- ${t}`
    return t
  }).filter((x) => x !== null)

  const block = [
    `## [${version}] - ${dateIso}`,
    '',
    subsection,
    '',
    ...bulletsNormalized,
    '',
  ]

  return [...lines.slice(0, insertIdx), ...block, ...lines.slice(insertIdx)].join(
    '\n'
  )
}
