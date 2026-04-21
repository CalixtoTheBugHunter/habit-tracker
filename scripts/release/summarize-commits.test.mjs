import { describe, it, expect } from 'vitest'
import {
  classifyCommitSubject,
  summarizeCommitSubjects,
} from './summarize-commits.mjs'

describe('classifyCommitSubject', () => {
  it('skips chore(release)', () => {
    expect(classifyCommitSubject('chore(release): v1.0.0').skip).toBe(true)
  })

  it('maps feat to Added', () => {
    const r = classifyCommitSubject('feat: add widget')
    expect(r.skip).toBeUndefined()
    expect(r.section).toBe('Added')
    expect(r.bullet).toBe('feat: add widget')
  })

  it('maps fix to Fixed', () => {
    expect(classifyCommitSubject('fix: crash on load').section).toBe('Fixed')
  })

  it('maps revert to Fixed', () => {
    expect(classifyCommitSubject('revert: feat: bad idea').section).toBe('Fixed')
  })

  it('maps docs to Changed', () => {
    expect(classifyCommitSubject('docs: readme').section).toBe('Changed')
  })

  it('maps chore(deps) to Changed', () => {
    expect(classifyCommitSubject('chore(deps): bump x').section).toBe('Changed')
  })

  it('maps non-conventional to Changed', () => {
    expect(classifyCommitSubject('random subject').section).toBe('Changed')
  })
})

describe('summarizeCommitSubjects', () => {
  it('groups, sorts, and skips release commits', () => {
    const out = summarizeCommitSubjects(
      [
        'feat: zebra',
        'chore(release): v0.1.0',
        'fix: ant',
        'docs: bee',
        'feat: apple',
      ],
      { cap: 50 }
    )
    expect(out.Added).toEqual(['feat: apple', 'feat: zebra'])
    expect(out.Fixed).toEqual(['fix: ant'])
    expect(out.Changed).toEqual(['docs: bee'])
  })

  it('adds compare line when truncated', () => {
    const lines = Array.from({ length: 60 }, (_, i) => `feat: item ${String(i).padStart(2, '0')}`)
    const out = summarizeCommitSubjects(lines, {
      cap: 3,
      compareUrl: 'https://github.com/o/r/compare/v1...abc',
    })
    expect(out.Added).toHaveLength(3)
    expect(out.Changed.some((l) => l.includes('truncated'))).toBe(true)
    expect(out.Changed.some((l) => l.includes('compare'))).toBe(true)
  })

  it('truncation message without compare url', () => {
    const lines = Array.from({ length: 5 }, (_, i) => `feat: n${i}`)
    const out = summarizeCommitSubjects(lines, { cap: 2, compareUrl: '' })
    expect(out.Changed.some((l) => l.includes('git history'))).toBe(true)
  })
})
