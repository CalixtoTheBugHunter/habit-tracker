import { describe, it, expect } from 'vitest'
import { toggleStackingHabitCompletion } from './toggleStackingHabitCompletion'
import { createMockHabit } from '../../test/fixtures/habits'
import { createDateString } from '../../test/utils/date-helpers'

describe('toggleStackingHabitCompletion', () => {
  it('adds today when habit has no stackingCompletions', () => {
    const parent = createMockHabit({ id: 'parent', stackingHabits: ['stack-1'] })
    const result = toggleStackingHabitCompletion(parent, 'stack-1')
    expect(result.stackingCompletions).toEqual({
      'stack-1': [createDateString(0)],
    })
    expect(result).not.toBe(parent)
  })

  it('removes today when stackingCompletions for that ID already includes today', () => {
    const today = createDateString(0)
    const parent = createMockHabit({
      id: 'parent',
      stackingHabits: ['stack-1'],
      stackingCompletions: { 'stack-1': [today] },
    })
    const result = toggleStackingHabitCompletion(parent, 'stack-1')
    expect(result.stackingCompletions).toBeUndefined()
    expect(result).not.toBe(parent)
  })

  it('adds today when stackingCompletions for that ID exists but does not include today', () => {
    const yesterday = createDateString(1)
    const parent = createMockHabit({
      id: 'parent',
      stackingHabits: ['stack-1'],
      stackingCompletions: { 'stack-1': [yesterday] },
    })
    const result = toggleStackingHabitCompletion(parent, 'stack-1')
    expect(result.stackingCompletions).toEqual({
      'stack-1': [yesterday, createDateString(0)],
    })
    expect(result).not.toBe(parent)
  })

  it('does not mutate original habit', () => {
    const parent = createMockHabit({ id: 'parent', stackingHabits: ['stack-1'] })
    const before = JSON.stringify(parent)
    toggleStackingHabitCompletion(parent, 'stack-1')
    expect(JSON.stringify(parent)).toBe(before)
  })
})
