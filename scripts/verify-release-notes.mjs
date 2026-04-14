#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const baseRef = process.env.GITHUB_BASE_REF ?? 'main'

execSync(`git fetch origin ${baseRef}`, {
  stdio: 'inherit',
  env: process.env,
})

const basePkgJson = execSync(`git show origin/${baseRef}:package.json`, {
  encoding: 'utf8',
})
const baseVersion = JSON.parse(basePkgJson).version
const headVersion = JSON.parse(readFileSync('package.json', 'utf8')).version

if (baseVersion === headVersion) {
  console.error(
    `package.json version must change on this branch (still ${baseVersion}).`
  )
  process.exit(1)
}

const manifest = JSON.parse(readFileSync('changelog-files.json', 'utf8'))
const changelogPaths = [...new Set(Object.values(manifest))]

for (const relPath of changelogPaths) {
  const diff = execSync(
    `git diff origin/${baseRef}...HEAD -- ${relPath}`,
    { encoding: 'utf8' }
  )

  const addedLines = diff
    .split('\n')
    .filter((line) => line.startsWith('+') && !line.startsWith('+++'))

  if (addedLines.length === 0) {
    console.error(
      `${relPath} must include new lines in this PR (locale changelog).`
    )
    process.exit(1)
  }

  const hasVersionInHeading = addedLines.some(
    (line) => line.includes('##') && line.includes(headVersion)
  )

  if (!hasVersionInHeading) {
    console.error(
      `${relPath} must add a ## line that mentions version ${headVersion}.`
    )
    process.exit(1)
  }
}

console.log(
  `Release notes OK: ${baseVersion} → ${headVersion} (${changelogPaths.join(', ')})`
)
