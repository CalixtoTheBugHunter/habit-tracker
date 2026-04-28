#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertReleaseChangelogManifest } from './assert-changelog-manifest.mjs'
import { resolveNextVersion } from './resolve-next-version.mjs'
import {
  firstChangelogReleaseVersion,
  prependReleaseWithSections,
  SECTION_ORDER,
  SUMMARY_HEADING_EN,
  SUMMARY_HEADING_PT,
} from './prepend-changelog.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../..')

const bumpKind = process.env.BUMP_KIND ?? ''
const explicitVersion = process.env.EXPLICIT_VERSION ?? ''
const sectionsJsonPath = process.env.RELEASE_SECTIONS_JSON ?? ''
const releaseNotesEnExtra = process.env.RELEASE_NOTES_EN_EXTRA ?? ''
const releaseNotesPtBrExtra = process.env.RELEASE_NOTES_PT_BR_EXTRA ?? ''
const aiSummariesJsonPath = process.env.AI_SUMMARIES_JSON ?? ''
const dateIso = process.env.RELEASE_DATE ?? new Date().toISOString().slice(0, 10)

const SUMMARY_HEADINGS = {
  en: SUMMARY_HEADING_EN,
  'pt-BR': SUMMARY_HEADING_PT,
}

const PT_DISCLAIMER =
  'Esta seção foi gerada automaticamente a partir dos mesmos commits que o [CHANGELOG em inglês](CHANGELOG.md). Os itens abaixo repetem o texto original dos commits.'

if (!sectionsJsonPath.trim()) {
  console.error('RELEASE_SECTIONS_JSON must point to a JSON file from summarize-commits.')
  process.exit(1)
}

/** @typedef {'Added'|'Changed'|'Fixed'} SectionKey */

/**
 * @param {unknown} raw
 * @returns {Record<SectionKey, string[]>}
 */
function normalizeSections(raw) {
  if (raw === null || typeof raw !== 'object') {
    throw new Error('RELEASE_SECTIONS_JSON must be a JSON object')
  }
  const o = /** @type {Record<string, unknown>} */ (raw)
  /** @type {Record<SectionKey, string[]>} */
  const out = { Added: [], Changed: [], Fixed: [] }
  for (const key of SECTION_ORDER) {
    const v = o[key]
    if (!Array.isArray(v)) continue
    out[key] = v.map((x) => String(x).trim()).filter(Boolean)
  }
  return out
}

/**
 * @param {Record<SectionKey, string[]>} sections
 * @param {string} extraBlock
 */
function mergeExtras(sections, extraBlock) {
  const extraLines = extraBlock
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (extraLines.length === 0) return sections
  return {
    Added: [...sections.Added],
    Changed: [...sections.Changed, ...extraLines],
    Fixed: [...sections.Fixed],
  }
}

/**
 * @param {Record<SectionKey, string[]>} s
 */
function totalBullets(s) {
  return SECTION_ORDER.reduce((n, k) => n + (s[k]?.length ?? 0), 0)
}

let baseSections
try {
  baseSections = normalizeSections(
    JSON.parse(readFileSync(sectionsJsonPath, 'utf8'))
  )
} catch (e) {
  console.error('Failed to read RELEASE_SECTIONS_JSON:', e)
  process.exit(1)
}

const sectionsEn = mergeExtras(baseSections, releaseNotesEnExtra)
// pt-BR mirrors EN (including English extras), then appends pt-only extras.
const sectionsPt = mergeExtras(
  {
    Added: [...sectionsEn.Added],
    Changed: [...sectionsEn.Changed],
    Fixed: [...sectionsEn.Fixed],
  },
  releaseNotesPtBrExtra
)

if (totalBullets(sectionsEn) === 0) {
  console.error(
    'No release note bullets (empty commit summary and no RELEASE_NOTES_*_EXTRA lines).'
  )
  process.exit(1)
}

const manifest = JSON.parse(
  readFileSync(join(root, 'changelog-files.json'), 'utf8')
)
assertReleaseChangelogManifest(manifest)

/** @type {Record<string, string>} */
let aiSummaries = {}
if (aiSummariesJsonPath.trim()) {
  try {
    const raw = JSON.parse(readFileSync(aiSummariesJsonPath, 'utf8'))
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error('AI_SUMMARIES_JSON must be a JSON object')
    }
    for (const locale of Object.keys(manifest)) {
      const v = raw[locale]
      if (typeof v !== 'string' || !v.trim()) {
        throw new Error(`AI_SUMMARIES_JSON missing or empty summary for locale: ${locale}`)
      }
      aiSummaries[locale] = v.trim()
    }
  } catch (e) {
    console.error('Failed to read AI_SUMMARIES_JSON:', e.message ?? e)
    process.exit(1)
  }
}

const pkgPath = join(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const current = pkg.version

const next = resolveNextVersion({
  bumpKind,
  explicitVersion,
  currentFromPackage: current,
})

for (const locale of ['en', 'pt-BR']) {
  const relPath = manifest[locale]
  const filePath = join(root, relPath)
  const content = readFileSync(filePath, 'utf8')
  const first = firstChangelogReleaseVersion(content)
  if (first === next) {
    console.error(
      `${relPath}: first release is already ${next}; refusing duplicate prepend.`
    )
    process.exit(1)
  }
  const sections = locale === 'en' ? sectionsEn : sectionsPt
  const updated = prependReleaseWithSections({
    fileContent: content,
    version: next,
    dateIso,
    locale,
    sections,
    ptDisclaimerMarkdown: locale === 'pt-BR' ? PT_DISCLAIMER : undefined,
    summary: aiSummaries[locale],
    summaryHeading: SUMMARY_HEADINGS[locale],
  })
  writeFileSync(filePath, updated)
}

pkg.version = next
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

console.log(`Release files updated to version ${next}`)
