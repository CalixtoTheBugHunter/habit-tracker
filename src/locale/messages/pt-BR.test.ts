import { describe, it, expect } from 'vitest'
import { en } from './en'
import { ptBR } from './pt-BR'

function collectKeyPaths(
  obj: unknown,
  prefix = ''
): string[] {
  if (obj === null || typeof obj !== 'object') {
    return prefix ? [prefix] : []
  }
  const acc: string[] = []
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key
    const val = (obj as Record<string, unknown>)[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      acc.push(...collectKeyPaths(val, path))
    } else {
      acc.push(path)
    }
  }
  return acc
}

function getPlaceholderNames(str: string): Set<string> {
  const set = new Set<string>()
  str.replace(/\{(\w+)\}/g, (_, name) => {
    set.add(name)
    return ''
  })
  return set
}

function getAtPath(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

describe('pt-BR messages', () => {
  it('should have the same key structure as en', () => {
    const enPaths = new Set(collectKeyPaths(en))
    const ptBRPaths = new Set(collectKeyPaths(ptBR))
    expect(ptBRPaths.size).toBe(enPaths.size)
    for (const path of enPaths) {
      expect(ptBRPaths.has(path)).toBe(true)
    }
  })

  it('should have the same placeholder names in strings that contain placeholders', () => {
    const enPaths = collectKeyPaths(en)
    for (const path of enPaths) {
      const enVal = getAtPath(en, path)
      if (typeof enVal !== 'string' || !enVal.includes('{')) continue
      const ptBRVal = getAtPath(ptBR, path)
      expect(typeof ptBRVal).toBe('string')
      const enPlaceholders = getPlaceholderNames(enVal)
      const ptBRPlaceholders = getPlaceholderNames(ptBRVal as string)
      expect(ptBRPlaceholders.size).toBe(enPlaceholders.size)
      for (const name of enPlaceholders) {
        expect(ptBRPlaceholders.has(name)).toBe(true)
      }
    }
  })
})
