#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolveNextVersion } from './resolve-next-version.mjs'

const bumpKind = process.env.BUMP_KIND ?? ''
const explicitVersion = process.env.EXPLICIT_VERSION ?? ''
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const next = resolveNextVersion({
  bumpKind,
  explicitVersion,
  currentFromPackage: pkg.version,
})

process.stdout.write(next)
