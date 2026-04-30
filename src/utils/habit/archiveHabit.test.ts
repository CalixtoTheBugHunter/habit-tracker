import { describe, it, expect } from 'vitest'
import { archiveHabit } from './archiveHabit'
import { createMockHabit } from '../../test/fixtures/habits'

describe('archiveHabit', () => {
  it('sets archivedAt to an ISO 8601 string', () => {
    const habit = createMockHabit({ id: '1' })
    const result = archiveHabit(habit)
    expect(typeof result.archivedAt).toBe('string')
    expect(() => new Date(result.archivedAt!).toISOString()).not.toThrow()
  })

  it('uses the provided now parameter when given', () => {
    const habit = createMockHabit({ id: '1' })
    const now = new Date('2026-04-30T12:00:00.000Z')
    const result = archiveHabit(habit, now)
    expect(result.archivedAt).toBe('2026-04-30T12:00:00.000Z')
  })

  it('does not mutate the input habit', () => {
    const habit = createMockHabit({ id: '1' })
    const snapshot = { ...habit }
    archiveHabit(habit)
    expect(habit).toEqual(snapshot)
    expect(habit.archivedAt).toBeUndefined()
  })

  it('overwrites an existing archivedAt value', () => {
    const habit = createMockHabit({ id: '1', archivedAt: '2020-01-01T00:00:00.000Z' })
    const now = new Date('2026-04-30T00:00:00.000Z')
    const result = archiveHabit(habit, now)
    expect(result.archivedAt).toBe('2026-04-30T00:00:00.000Z')
  })

  it('preserves all other habit fields', () => {
    const habit = createMockHabit({
      id: '1',
      name: 'Exercise',
      description: 'Daily workout',
      completionDates: ['2026-01-01T00:00:00.000Z'],
      goalDays: [1, 2, 3],
    })
    const result = archiveHabit(habit)
    expect(result.id).toBe(habit.id)
    expect(result.name).toBe(habit.name)
    expect(result.description).toBe(habit.description)
    expect(result.completionDates).toEqual(habit.completionDates)
    expect(result.goalDays).toEqual(habit.goalDays)
  })
})
