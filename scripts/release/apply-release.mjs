#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveNextVersion } from './resolve-next-version.mjs'
import {
  firstChangelogReleaseVersion,
  prependReleaseSection,
} from './prepend-changelog.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../..')

const bumpKind = process.env.BUMP_KIND ?? ''
const explicitVersion = process.env.EXPLICIT_VERSION ?? ''
const releaseNotesEn = process.env.RELEASE_NOTES_EN ?? ''
const releaseNotesPtBr = process.env.RELEASE_NOTES_PT_BR ?? ''
const dateIso = process.env.RELEASE_DATE ?? new Date().toISOString().slice(0, 10)

if (!releaseNotesEn.trim() || !releaseNotesPtBr.trim()) {
  console.error(
    'RELEASE_NOTES_EN and RELEASE_NOTES_PT_BR must be non-empty (workflow inputs).'
  )
  process.exit(1)
}

const manifest = JSON.parse(
  readFileSync(join(root, 'changelog-files.json'), 'utf8')
)
const pkgPath = join(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const current = pkg.version

const next = resolveNextVersion({
  bumpKind,
  explicitVersion,
  currentFromPackage: current,
})

const bulletsEn = releaseNotesEn
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean)
const bulletsPt = releaseNotesPtBr
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean)

for (const [locale, relPath] of Object.entries(manifest)) {
  if (locale !== 'en' && locale !== 'pt-BR') continue
  const filePath = join(root, relPath)
  const content = readFileSync(filePath, 'utf8')
  const first = firstChangelogReleaseVersion(content)
  if (first === next) {
    console.error(
      `${relPath}: first release is already ${next}; refusing duplicate prepend.`
    )
    process.exit(1)
  }
  const bullets = locale === 'en' ? bulletsEn : bulletsPt
  const updated = prependReleaseSection({
    fileContent: content,
    version: next,
    dateIso,
    locale,
    bulletLines: bullets,
  })
  writeFileSync(filePath, updated)
}

pkg.version = next
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

console.log(`Release files updated to version ${next}`)
