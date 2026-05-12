import { describe, it, expect } from 'vitest'
import { compareHabitsDisplayOrder, sortHabitsByDisplayOrder } from './sortHabitsByDisplayOrder'
import type { Habit } from '../../types/habit'

const base = (overrides: Partial<Habit>): Habit => ({
  id: 'id',
  createdDate: '2025-01-01T00:00:00.000Z',
  completionDates: [],
  ...overrides,
})

describe('compareHabitsDisplayOrder', () => {
  it('orders by sortOrder ascending', () => {
    expect(
      compareHabitsDisplayOrder(
        base({ id: 'b', sortOrder: 1 }),
        base({ id: 'a', sortOrder: 0 })
      )
    ).toBeGreaterThan(0)
  })

  it('places missing sortOrder after explicit sortOrder', () => {
    expect(compareHabitsDisplayOrder(base({ id: 'a', sortOrder: 0 }), base({ id: 'b' }))).toBeLessThan(0)
  })

  it('ties with createdDate then id', () => {
    expect(
      compareHabitsDisplayOrder(
        base({ id: 'b', sortOrder: 0, createdDate: '2025-01-02T00:00:00.000Z' }),
        base({ id: 'a', sortOrder: 0, createdDate: '2025-01-01T00:00:00.000Z' })
      )
    ).toBeGreaterThan(0)
    expect(
      compareHabitsDisplayOrder(
        base({ id: 'a', sortOrder: 0, createdDate: '2025-01-01T00:00:00.000Z' }),
        base({ id: 'b', sortOrder: 0, createdDate: '2025-01-01T00:00:00.000Z' })
      )
    ).toBeLessThan(0)
  })
})

describe('sortHabitsByDisplayOrder', () => {
  it('returns a new sorted array without mutating input', () => {
    const input = [
      base({ id: 'z', sortOrder: 2 }),
      base({ id: 'x', sortOrder: 0 }),
      base({ id: 'y', sortOrder: 1 }),
    ]
    const out = sortHabitsByDisplayOrder(input)
    expect(out.map(h => h.id)).toEqual(['x', 'y', 'z'])
    expect(input.map(h => h.id)).toEqual(['z', 'x', 'y'])
  })
})
