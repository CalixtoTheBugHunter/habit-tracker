#!/usr/bin/env node
/**
 * Builds the prompt sent to GitHub Models to draft a release summary.
 *
 * The model is asked to return strict JSON: one key per locale, each value a
 * short prose paragraph (2-4 sentences) describing the release. No markdown,
 * no bullet lists — those are already covered by the rule-based Added/Changed/
 * Fixed sections.
 *
 * @see buildAiSummaryPrompt (exported for tests)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** @typedef {'Added'|'Changed'|'Fixed'} SectionKey */

/** @type {SectionKey[]} */
const SECTION_KEYS = ['Added', 'Changed', 'Fixed']

/**
 * @param {object} opts
 * @param {string} opts.version - The release version (e.g. "0.5.0")
 * @param {string[]} opts.locales - Locale keys from changelog-files.json (e.g. ["en", "pt-BR"])
 * @param {Partial<Record<SectionKey, string[]>>} opts.sections - Commit bullets grouped by section
 * @param {string} [opts.compareUrl] - Optional GitHub compare URL for context
 * @returns {string}
 */
export function buildAiSummaryPrompt({ version, locales, sections, compareUrl }) {
  const localeList = locales.map((l) => `"${l}"`).join(', ')
  const schemaKeys = locales.map((l) => `  "${l}": "…paragraph in ${l}…"`).join(',\n')

  const total = SECTION_KEYS.reduce(
    (n, k) => n + (sections[k]?.length ?? 0),
    0
  )

  const commitLines = SECTION_KEYS.flatMap((k) => {
    const list = sections[k] ?? []
    if (list.length === 0) return []
    return [`${k}:`, ...list.map((l) => `- ${l}`), '']
  }).join('\n').trim()

  const compareLine = compareUrl?.trim()
    ? `\nCompare view for this release: ${compareUrl.trim()}\n`
    : ''

  const initialGuidance =
    total === 0
      ? 'This is an initial release with no prior commits to compare. Write a short paragraph introducing the project as a first release.'
      : 'Paraphrase only what is present in the commits below. Do not invent features, bug fixes, or improvements that are not listed.'

  return `You are drafting the release summary for version ${version} of a software project.

Return STRICT JSON with exactly these keys: ${localeList}.
Each value must be a plain prose paragraph of 2-4 sentences, written in the language of its key.
Do NOT include markdown (no headings, no bullet lists, no code fences), and do NOT wrap the JSON in a code block.

Expected shape:
{
${schemaKeys}
}

Guidance:
- Neutral, factual tone. No marketing language.
- ${initialGuidance}
- Highlight the most impactful changes; omit trivial ones.
- Keep each paragraph self-contained; do not cross-reference the other locale.
${compareLine}
Commits in this release:
${commitLines || '(no commits)'}
`
}

function parseArgs(argv) {
  /** @type {{ sections?: string, locales: string[], version: string, compareUrl: string, output?: string }} */
  const out = { locales: [], version: '', compareUrl: '' }
  for (const a of argv) {
    if (a.startsWith('--sections=')) out.sections = a.slice('--sections='.length)
    else if (a.startsWith('--locales='))
      out.locales = a
        .slice('--locales='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    else if (a.startsWith('--version=')) out.version = a.slice('--version='.length)
    else if (a.startsWith('--compare-url='))
      out.compareUrl = a.slice('--compare-url='.length)
    else if (a.startsWith('--output=')) out.output = a.slice('--output='.length)
  }
  return out
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.sections) {
    console.error('--sections=<path> is required')
    process.exit(1)
  }
  if (args.locales.length === 0) {
    console.error('--locales=a,b is required')
    process.exit(1)
  }
  if (!args.version) {
    console.error('--version=X.Y.Z is required')
    process.exit(1)
  }
  const sections = JSON.parse(readFileSync(args.sections, 'utf8'))
  const prompt = buildAiSummaryPrompt({
    version: args.version,
    locales: args.locales,
    sections,
    compareUrl: args.compareUrl,
  })
  if (args.output) writeFileSync(args.output, prompt)
  else process.stdout.write(prompt)
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) main()
