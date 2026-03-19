import { describe, it, expect } from 'vitest'
import { wouldCreateStackingCycle } from './wouldCreateStackingCycle'
import { createMockHabit } from '../../test/fixtures/habits'

describe('wouldCreateStackingCycle', () => {
  it('returns true for self-reference (candidateId === currentHabitId)', () => {
    const habits = [createMockHabit({ id: 'a' })]
    expect(wouldCreateStackingCycle('a', 'a', habits)).toBe(true)
  })

  it('returns true for direct cycle A→B, adding B to A would create B→A cycle', () => {
    const habits = [
      createMockHabit({ id: 'a', stackingHabits: ['b'] }),
      createMockHabit({ id: 'b', stackingHabits: ['a'] }),
    ]
    expect(wouldCreateStackingCycle('a', 'b', habits)).toBe(true)
  })

  it('returns false when no cycle (A and B independent)', () => {
    const habits = [
      createMockHabit({ id: 'a' }),
      createMockHabit({ id: 'b' }),
    ]
    expect(wouldCreateStackingCycle('a', 'b', habits)).toBe(false)
  })

  it('returns true for transitive cycle A→B→C→A', () => {
    const habits = [
      createMockHabit({ id: 'a', stackingHabits: ['b'] }),
      createMockHabit({ id: 'b', stackingHabits: ['c'] }),
      createMockHabit({ id: 'c', stackingHabits: ['a'] }),
    ]
    expect(wouldCreateStackingCycle('a', 'b', habits)).toBe(true)
  })

  it('returns false when habits array is empty', () => {
    expect(wouldCreateStackingCycle('a', 'b', [])).toBe(false)
  })

  it('returns false when candidate not in habits', () => {
    const habits = [createMockHabit({ id: 'a' })]
    expect(wouldCreateStackingCycle('a', 'b', habits)).toBe(false)
  })
})
