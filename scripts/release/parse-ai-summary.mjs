#!/usr/bin/env node
/**
 * Parses the raw response from GitHub Models into a per-locale summary map.
 *
 * The model is instructed to return strict JSON, but may still wrap it in
 * ```json … ``` fences or include stray leading/trailing whitespace. This
 * parser strips those and validates that every requested locale has a
 * non-empty prose paragraph (no markdown headings).
 *
 * @see parseAiSummary (exported for tests)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * @param {string} raw
 * @returns {string}
 */
function stripCodeFences(raw) {
  let s = raw.trim()
  if (s.startsWith('```')) {
    const firstNewline = s.indexOf('\n')
    if (firstNewline !== -1) s = s.slice(firstNewline + 1)
    if (s.endsWith('```')) s = s.slice(0, -3)
  }
  return s.trim()
}

/**
 * @param {string} raw
 * @param {string[]} locales
 * @returns {Record<string, string>}
 */
export function parseAiSummary(raw, locales) {
  const stripped = stripCodeFences(raw ?? '')
  if (!stripped) {
    throw new Error('AI summary response is empty')
  }

  let parsed
  try {
    parsed = JSON.parse(stripped)
  } catch (e) {
    throw new Error(`AI summary response is not valid JSON: ${e.message}`)
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI summary response must be a JSON object')
  }

  /** @type {Record<string, string>} */
  const out = {}
  for (const locale of locales) {
    const v = parsed[locale]
    if (typeof v !== 'string') {
      throw new Error(`AI summary missing locale: ${locale}`)
    }
    const trimmed = v.trim()
    if (!trimmed) {
      throw new Error(`AI summary is empty for locale: ${locale}`)
    }
    if (/^###\s/m.test(trimmed) || /\n\n\n/.test(trimmed)) {
      throw new Error(
        `AI summary for locale ${locale} contains markdown headings or excessive blank lines; expected prose only`
      )
    }
    out[locale] = trimmed
  }
  return out
}

function parseArgs(argv) {
  /** @type {{ input?: string, locales: string[], output?: string }} */
  const out = { locales: [] }
  for (const a of argv) {
    if (a.startsWith('--input=')) out.input = a.slice('--input='.length)
    else if (a.startsWith('--locales='))
      out.locales = a
        .slice('--locales='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    else if (a.startsWith('--output=')) out.output = a.slice('--output='.length)
  }
  return out
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.input) {
    console.error('--input=<path> is required')
    process.exit(1)
  }
  if (args.locales.length === 0) {
    console.error('--locales=a,b is required')
    process.exit(1)
  }
  const raw = readFileSync(args.input, 'utf8')
  let parsed
  try {
    parsed = parseAiSummary(raw, args.locales)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
  const json = `${JSON.stringify(parsed, null, 2)}\n`
  if (args.output) writeFileSync(args.output, json)
  else process.stdout.write(json)
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) main()
