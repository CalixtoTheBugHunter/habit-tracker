import { copyFileSync, existsSync, readFileSync } from 'fs'
import { basename, resolve } from 'path'
import type { Plugin } from 'vite'

function manifestPath(root: string): string {
  return resolve(root, 'changelog-files.json')
}

function changelogPathsFromManifest(root: string): string[] {
  const mp = manifestPath(root)
  if (!existsSync(mp)) {
    return [resolve(root, 'CHANGELOG.md')]
  }
  const data = JSON.parse(readFileSync(mp, 'utf-8')) as Record<string, string>
  return [...new Set(Object.values(data).map((rel) => resolve(root, rel)))]
}

function basenamesFromManifest(root: string): string[] {
  const mp = manifestPath(root)
  if (!existsSync(mp)) {
    return ['CHANGELOG.md']
  }
  const data = JSON.parse(readFileSync(mp, 'utf-8')) as Record<string, string>
  return [...new Set(Object.values(data).map((rel) => basename(rel)))]
}

function sourcePathForBasename(root: string, name: string): string {
  const mp = manifestPath(root)
  if (!existsSync(mp)) {
    return resolve(root, 'CHANGELOG.md')
  }
  const data = JSON.parse(readFileSync(mp, 'utf-8')) as Record<string, string>
  const rel = Object.values(data).find((p) => basename(p) === name)
  return rel ? resolve(root, rel) : resolve(root, 'CHANGELOG.md')
}

/**
 * Serves repo-root changelog files from changelog-files.json in dev and copies them to outDir on build.
 */
export function changelogMdFromRootPlugin(): Plugin {
  let root = process.cwd()
  let outDir = 'dist'

  return {
    name: 'changelog-md-from-root',
    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? ''
        const names = basenamesFromManifest(root)
        const matched = names.find((n) => pathname.endsWith(`/${n}`))
        if (!matched) {
          next()
          return
        }
        const changelogPath = sourcePathForBasename(root, matched)
        if (!existsSync(changelogPath)) {
          res.statusCode = 404
          res.end()
          return
        }
        const body = readFileSync(changelogPath, 'utf-8')
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
        res.end(body)
      })
    },
    closeBundle() {
      for (const changelogPath of changelogPathsFromManifest(root)) {
        if (!existsSync(changelogPath)) {
          continue
        }
        const dest = resolve(root, outDir, basename(changelogPath))
        copyFileSync(changelogPath, dest)
      }
    },
  }
}
