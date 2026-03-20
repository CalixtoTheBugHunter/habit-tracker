import { describe, it, expect } from 'vitest'
import { removeStackingHabit } from './removeStackingHabit'
import { createMockHabit } from '../../test/fixtures/habits'
import { createDateString } from '../../test/utils/date-helpers'

describe('removeStackingHabit', () => {
  it('removes id from stackingHabits', () => {
    const parent = createMockHabit({
      id: 'p',
      stackingHabits: ['a', 'b', 'c'],
    })
    const result = removeStackingHabit(parent, 'b')
    expect(result.stackingHabits).toEqual(['a', 'c'])
    expect(result).not.toBe(parent)
  })

  it('removes key from stackingCompletions when present', () => {
    const today = createDateString(0)
    const parent = createMockHabit({
      id: 'p',
      stackingHabits: ['a'],
      stackingCompletions: { a: [today] },
    })
    const result = removeStackingHabit(parent, 'a')
    expect(result.stackingCompletions).toBeUndefined()
    expect(result.stackingHabits).toBeUndefined()
  })

  it('does not mutate original habit', () => {
    const parent = createMockHabit({ id: 'p', stackingHabits: ['a'] })
    const before = JSON.stringify(parent)
    removeStackingHabit(parent, 'a')
    expect(JSON.stringify(parent)).toBe(before)
  })

  it('returns undefined stackingHabits when last id removed', () => {
    const parent = createMockHabit({ id: 'p', stackingHabits: ['a'] })
    const result = removeStackingHabit(parent, 'a')
    expect(result.stackingHabits).toBeUndefined()
  })

  it('leaves habit unchanged when id not in stackingHabits', () => {
    const parent = createMockHabit({ id: 'p', stackingHabits: ['a'] })
    const result = removeStackingHabit(parent, 'x')
    expect(result.stackingHabits).toEqual(['a'])
    expect(result.stackingCompletions).toBeUndefined()
  })

  it('removes key from stackingStepLabels when present', () => {
    const parent = createMockHabit({
      id: 'p',
      stackingHabits: ['a', 'b'],
      stackingStepLabels: { a: 'Step A', b: 'Step B' },
    })
    const result = removeStackingHabit(parent, 'a')
    expect(result.stackingHabits).toEqual(['b'])
    expect(result.stackingStepLabels).toEqual({ b: 'Step B' })
  })
})
