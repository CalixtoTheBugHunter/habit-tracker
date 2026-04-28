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

/** @typedef {'Added'|'Changed'|'Fixed'} SectionKey */

/** @type {SectionKey[]} */
export const SECTION_ORDER = ['Added', 'Changed', 'Fixed']

export const SUMMARY_HEADING_EN = 'Summary'
export const SUMMARY_HEADING_PT = 'Resumo'

const HEADINGS_EN = {
  Added: '### Added',
  Changed: '### Changed',
  Fixed: '### Fixed',
}

const HEADINGS_PT = {
  Added: '### Adicionado',
  Changed: '### Alterado',
  Fixed: '### Corrigido',
}

/**
 * @param {string} line
 */
function normalizeBullet(line) {
  const t = line.trim()
  if (!t) return null
  if (!t.startsWith('-')) return `- ${t}`
  return t
}

/**
 * @param {object} opts
 * @param {string} opts.fileContent
 * @param {string} opts.version
 * @param {string} opts.dateIso YYYY-MM-DD
 * @param {'en' | 'pt-BR'} opts.locale
 * @param {Partial<Record<SectionKey, string[]>>} opts.sections
 * @param {string} [opts.ptDisclaimerMarkdown] inserted under ### Nota (pt-BR only)
 * @param {string} [opts.summary] prose paragraph inserted above the sections
 * @param {string} [opts.summaryHeading] heading text for the summary block (e.g. "Summary", "Resumo")
 */
export function prependReleaseWithSections({
  fileContent,
  version,
  dateIso,
  locale,
  sections,
  ptDisclaimerMarkdown,
  summary,
  summaryHeading,
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

  const headings = locale === 'pt-BR' ? HEADINGS_PT : HEADINGS_EN
  /** @type {string[]} */
  const block = [`## [${version}] - ${dateIso}`, '']

  if (locale === 'pt-BR' && ptDisclaimerMarkdown?.trim()) {
    block.push('### Nota', '', ptDisclaimerMarkdown.trim(), '')
  }

  const summaryText = summary?.trim()
  if (summaryText && summaryHeading?.trim()) {
    block.push(`### ${summaryHeading.trim()}`, '', summaryText, '')
  }

  for (const key of SECTION_ORDER) {
    const list = sections[key] ?? []
    const bullets = list
      .map(normalizeBullet)
      .filter((x) => x !== null)
    if (bullets.length === 0) continue
    block.push(headings[key], '', ...bullets, '')
  }

  return [...lines.slice(0, insertIdx), ...block, ...lines.slice(insertIdx)].join(
    '\n'
  )
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
  return prependReleaseWithSections({
    fileContent,
    version,
    dateIso,
    locale,
    sections: { Added: bulletLines },
  })
}
