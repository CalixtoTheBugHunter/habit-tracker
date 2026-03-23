import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getHabitsToPersistAfterStackingToggle } from './stackingCompletionCoordinator'
import { createMockHabit } from '../../test/fixtures/habits'
import { createDateString } from '../../test/utils/date-helpers'

describe('stackingCompletionCoordinator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns parent with auto completion when second resolved child is toggled on', () => {
    const today = createDateString(0)
    const parent = createMockHabit({
      id: 'p',
      stackingHabits: ['a', 'b'],
      completionDates: [],
    })
    const a = createMockHabit({ id: 'a', completionDates: [today] })
    const b = createMockHabit({ id: 'b', completionDates: [] })
    const habits = [parent, a, b]

    const out = getHabitsToPersistAfterStackingToggle(habits, 'p', 'b')

    expect(out).toHaveLength(2)
    const [child, parentHabit] = out
    expect(child!.id).toBe('b')
    expect(child!.completionDates).toContain(today)
    expect(parentHabit!.id).toBe('p')
    expect(parentHabit!.completionDates).toContain(today)
    expect(parentHabit!.autoCompletedDates).toContain(today)
  })

  it('returns child and parent clearing auto when unchecking after auto-complete', () => {
    const today = createDateString(0)
    const parent = createMockHabit({
      id: 'p',
      stackingHabits: ['a', 'b'],
      completionDates: [today],
      autoCompletedDates: [today],
    })
    const a = createMockHabit({ id: 'a', completionDates: [today] })
    const b = createMockHabit({ id: 'b', completionDates: [today] })
    const habits = [parent, a, b]

    const out = getHabitsToPersistAfterStackingToggle(habits, 'p', 'b')

    const [child, parentHabit] = out
    expect(child!.id).toBe('b')
    expect(child!.completionDates).toHaveLength(0)
    expect(parentHabit!.id).toBe('p')
    expect(parentHabit!.completionDates).toHaveLength(0)
    expect(parentHabit!.autoCompletedDates).toBeUndefined()
  })

  it('handles stacking-only step on parent', () => {
    const today = createDateString(0)
    const parent = createMockHabit({
      id: 'p',
      stackingHabits: ['step-1'],
      stackingCompletions: {},
    })
    const habits = [parent]

    const out = getHabitsToPersistAfterStackingToggle(habits, 'p', 'step-1')

    expect(out).toHaveLength(1)
    const [only] = out
    expect(only!.id).toBe('p')
    expect(only!.stackingCompletions?.['step-1']).toContain(today)
    expect(only!.completionDates).toContain(today)
    expect(only!.autoCompletedDates).toContain(today)
  })

  it('returns empty array when parent is missing', () => {
    expect(getHabitsToPersistAfterStackingToggle([], 'missing', 'x')).toEqual([])
  })
})
