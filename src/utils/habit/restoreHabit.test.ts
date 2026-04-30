import { describe, it, expect } from 'vitest'
import { restoreHabit } from './restoreHabit'
import { createMockHabit } from '../../test/fixtures/habits'

describe('restoreHabit', () => {
  it('removes the archivedAt field entirely', () => {
    const habit = createMockHabit({ id: '1', archivedAt: '2026-04-30T00:00:00.000Z' })
    const result = restoreHabit(habit)
    expect(result.archivedAt).toBeUndefined()
    expect('archivedAt' in result).toBe(false)
  })

  it('preserves all other fields', () => {
    const habit = createMockHabit({
      id: '1',
      name: 'Exercise',
      description: 'Daily workout',
      completionDates: ['2026-01-01T00:00:00.000Z'],
      goalDays: [1, 2, 3],
      archivedAt: '2026-04-30T00:00:00.000Z',
    })
    const result = restoreHabit(habit)
    expect(result.id).toBe(habit.id)
    expect(result.name).toBe(habit.name)
    expect(result.description).toBe(habit.description)
    expect(result.completionDates).toEqual(habit.completionDates)
    expect(result.goalDays).toEqual(habit.goalDays)
  })

  it('is a no-op for an already-active habit', () => {
    const habit = createMockHabit({ id: '1' })
    const result = restoreHabit(habit)
    expect(result.archivedAt).toBeUndefined()
    expect(result).toEqual(habit)
  })

  it('does not mutate the input habit', () => {
    const habit = createMockHabit({ id: '1', archivedAt: '2026-04-30T00:00:00.000Z' })
    restoreHabit(habit)
    expect(habit.archivedAt).toBe('2026-04-30T00:00:00.000Z')
  })
})
