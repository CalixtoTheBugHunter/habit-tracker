import { describe, it, expect } from 'vitest'
import { nextSortOrderForNewHabit } from './nextSortOrderForNewHabit'
import type { Habit } from '../../types/habit'

const h = (overrides: Partial<Habit>): Habit => ({
  id: '1',
  createdDate: '2025-01-01T00:00:00.000Z',
  completionDates: [],
  ...overrides,
})

describe('nextSortOrderForNewHabit', () => {
  it('returns 0 when there are no active habits', () => {
    expect(nextSortOrderForNewHabit([])).toBe(0)
    expect(nextSortOrderForNewHabit([h({ id: 'a', archivedAt: '2025-02-01T00:00:00.000Z' })])).toBe(0)
  })

  it('returns max active sortOrder plus one', () => {
    expect(
      nextSortOrderForNewHabit([
        h({ id: 'a', sortOrder: 0 }),
        h({ id: 'b', sortOrder: 5 }),
        h({ id: 'c', archivedAt: '2025-02-01T00:00:00.000Z', sortOrder: 99 }),
      ])
    ).toBe(6)
  })

  it('ignores undefined sortOrder on active habits', () => {
    expect(nextSortOrderForNewHabit([h({ id: 'a' }), h({ id: 'b' })])).toBe(0)
  })
})
