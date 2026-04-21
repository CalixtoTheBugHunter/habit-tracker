#!/usr/bin/env node
/**
 * Writes release range for `git log FROM..HEAD` to GITHUB_OUTPUT:
 * - from_ref: latest merged semver `v*` tag, or root commit if none
 * - from_tag: same tag including `v` prefix, or empty when using root
 */
import { execSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { compareSemver, assertStrictSemver } from './semver.mjs'

function listMergedVTags() {
  try {
    const out = execSync('git tag --merged HEAD --list "v*"', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return out.split(/\n/).map((s) => s.trim()).filter(Boolean)
  } catch {
    return []
  }
}

/** @param {string} tag */
function strictSemverTag(tag) {
  if (!tag.startsWith('v')) return null
  const inner = tag.slice(1)
  try {
    assertStrictSemver(inner)
    return tag
  } catch {
    return null
  }
}

try {
  execSync('git fetch --tags origin', { stdio: 'ignore' })
} catch {
  // best-effort; local tags may still be enough
}

const candidates = listMergedVTags()
  .map(strictSemverTag)
  .filter((t) => t !== null)

let bestTag = ''
let bestVer = ''
for (const t of candidates) {
  const ver = t.slice(1)
  if (!bestTag) {
    bestTag = t
    bestVer = ver
    continue
  }
  if (compareSemver(ver, bestVer) > 0) {
    bestTag = t
    bestVer = ver
  }
}

const fromTag = bestTag
const fromRef =
  fromTag ||
  execSync('git rev-list --max-parents=0 HEAD', { encoding: 'utf8' }).trim()

const ghOut = process.env.GITHUB_OUTPUT
if (ghOut) {
  appendFileSync(ghOut, `from_ref=${fromRef}\n`)
  appendFileSync(ghOut, `from_tag=${fromTag}\n`)
} else {
  process.stdout.write(
    `from_ref=${fromRef}\nfrom_tag=${fromTag}\n(for local use; set GITHUB_OUTPUT in CI)\n`
  )
}
