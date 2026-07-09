import { describe, it, expect } from 'vitest'
import { filterHabitsByCategories } from './filterHabitsByCategories'
import { createMockHabit } from '../../test/fixtures/habits'

describe('filterHabitsByCategories', () => {
  const work = createMockHabit({ id: '1', name: 'Work', categories: ['a'] })
  const health = createMockHabit({ id: '2', name: 'Health', categories: ['b'] })
  const both = createMockHabit({ id: '3', name: 'Both', categories: ['a', 'b'] })
  const none = createMockHabit({ id: '4', name: 'None' })
  const habits = [work, health, both, none]

  it('returns all habits when no category is selected', () => {
    expect(filterHabitsByCategories(habits, [])).toBe(habits)
  })

  it('returns habits matching a single selected category', () => {
    const result = filterHabitsByCategories(habits, ['a'])
    expect(result).toEqual([work, both])
  })

  it('matches any of several selected categories (OR semantics)', () => {
    const result = filterHabitsByCategories(habits, ['a', 'b'])
    expect(result).toEqual([work, health, both])
  })

  it('excludes habits without any categories when filtering', () => {
    const result = filterHabitsByCategories(habits, ['a'])
    expect(result).not.toContain(none)
  })

  it('returns an empty array when no habit matches the selection', () => {
    expect(filterHabitsByCategories(habits, ['zzz'])).toEqual([])
  })
})
