import { describe, it, expect } from 'vitest'
import { removeCategoryFromHabits } from './removeCategoryFromHabits'
import { createMockHabit } from '../../test/fixtures/habits'

describe('removeCategoryFromHabits', () => {
  it('removes the category id from habits that reference it', () => {
    const habits = [
      createMockHabit({ id: '1', categories: ['a', 'b'] }),
      createMockHabit({ id: '2', categories: ['a'] }),
    ]
    const changed = removeCategoryFromHabits(habits, 'a')
    expect(changed).toHaveLength(2)
    expect(changed[0]!.categories).toEqual(['b'])
    expect(changed[1]!.categories).toBeUndefined()
  })

  it('returns only the habits that changed', () => {
    const habits = [
      createMockHabit({ id: '1', categories: ['a'] }),
      createMockHabit({ id: '2', categories: ['b'] }),
      createMockHabit({ id: '3' }),
    ]
    const changed = removeCategoryFromHabits(habits, 'a')
    expect(changed.map(h => h.id)).toEqual(['1'])
  })

  it('sets categories to undefined when no categories remain', () => {
    const habits = [createMockHabit({ id: '1', categories: ['a'] })]
    const changed = removeCategoryFromHabits(habits, 'a')
    expect(changed[0]!.categories).toBeUndefined()
  })

  it('returns an empty array when no habit references the category', () => {
    const habits = [createMockHabit({ id: '1', categories: ['b'] })]
    expect(removeCategoryFromHabits(habits, 'a')).toEqual([])
  })
})
