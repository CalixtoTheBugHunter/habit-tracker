#!/usr/bin/env node
/**
 * Reads one commit subject per line; writes JSON { Added, Changed, Fixed } (arrays of strings).
 * @see summarizeCommitSubjects (exported for tests)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** @typedef {'Added'|'Changed'|'Fixed'} SectionKey */

/** @type {SectionKey[]} */
const SECTION_KEYS = ['Added', 'Changed', 'Fixed']

const CONVENTIONAL =
  /^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/i

/**
 * @param {string} subject
 * @returns {{ skip?: true, section?: SectionKey, bullet: string }}
 */
export function classifyCommitSubject(subject) {
  const t = subject.trim()
  if (!t) return { skip: true, bullet: '' }
  if (/^chore\(release\):/i.test(t)) return { skip: true, bullet: '' }

  const m = t.match(CONVENTIONAL)
  if (!m) {
    return { section: 'Changed', bullet: t }
  }

  const type = m[1].toLowerCase()
  const scope = (m[2] ?? '').toLowerCase()
  const bullet = t

  if (type === 'feat') return { section: 'Added', bullet }
  if (type === 'fix') return { section: 'Fixed', bullet }
  if (type === 'revert') return { section: 'Fixed', bullet }

  if (type === 'chore' && scope === 'deps')
    return { section: 'Changed', bullet }

  const changedTypes = new Set([
    'docs',
    'style',
    'refactor',
    'perf',
    'build',
    'ci',
    'chore',
    'test',
  ])
  if (changedTypes.has(type)) return { section: 'Changed', bullet }

  return { section: 'Changed', bullet }
}

/**
 * @param {string[]} subjects
 * @param {{ cap?: number, compareUrl?: string }} [opts]
 */
export function summarizeCommitSubjects(subjects, opts = {}) {
  const cap = opts.cap ?? 50
  const compareUrl = opts.compareUrl?.trim() ?? ''

  /** @type {Record<SectionKey, string[]>} */
  const groups = { Added: [], Changed: [], Fixed: [] }

  for (const line of subjects) {
    const r = classifyCommitSubject(line)
    if (r.skip) continue
    const section = /** @type {SectionKey} */ (r.section ?? 'Changed')
    groups[section].push(r.bullet)
  }

  for (const key of SECTION_KEYS) {
    groups[key].sort((a, b) => a.localeCompare(b))
  }

  let truncated = false
  for (const key of SECTION_KEYS) {
    if (groups[key].length > cap) {
      groups[key] = groups[key].slice(0, cap)
      truncated = true
    }
  }

  if (truncated && compareUrl) {
    groups.Changed.push(
      `Release notes truncated per section (cap=${cap}); full history: ${compareUrl}`
    )
  } else if (truncated) {
    groups.Changed.push(
      `Release notes truncated per section (cap=${cap}); see git history for this release.`
    )
  }

  return groups
}

function parseArgs(argv) {
  /** @type {{ input?: string, output?: string, cap: number, compareUrl: string }} */
  const out = { cap: 50, compareUrl: '' }
  for (const a of argv) {
    if (a.startsWith('--input=')) out.input = a.slice('--input='.length)
    else if (a.startsWith('--output=')) out.output = a.slice('--output='.length)
    else if (a.startsWith('--cap='))
      out.cap = Math.max(1, Number(a.slice('--cap='.length)) || 50)
    else if (a.startsWith('--compare-url='))
      out.compareUrl = a.slice('--compare-url='.length)
  }
  return out
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const raw =
    args.input !== undefined
      ? readFileSync(args.input, 'utf8')
      : readFileSync(0, 'utf8')
  const subjects = raw.split(/\r?\n/).map((s) => s.trimEnd())
  const groups = summarizeCommitSubjects(subjects, {
    cap: args.cap,
    compareUrl: args.compareUrl,
  })
  const json = `${JSON.stringify(groups, null, 2)}\n`
  if (args.output) writeFileSync(args.output, json)
  else process.stdout.write(json)
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) main()
