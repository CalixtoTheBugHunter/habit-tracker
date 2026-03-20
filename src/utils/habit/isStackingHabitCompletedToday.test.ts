import { describe, it, expect } from 'vitest'
import { isStackingHabitCompletedToday } from './isStackingHabitCompletedToday'
import { createDateString } from '../../test/utils/date-helpers'

describe('isStackingHabitCompletedToday', () => {
  it('returns false when stackingCompletions is undefined', () => {
    expect(isStackingHabitCompletedToday(undefined, 'habit-1')).toBe(false)
  })

  it('returns false when stackingCompletions is empty object', () => {
    expect(isStackingHabitCompletedToday({}, 'habit-1')).toBe(false)
  })

  it('returns false when key is missing', () => {
    expect(isStackingHabitCompletedToday({ 'other-id': [createDateString(0)] }, 'habit-1')).toBe(false)
  })

  it('returns false when key has empty array', () => {
    expect(isStackingHabitCompletedToday({ 'habit-1': [] }, 'habit-1')).toBe(false)
  })

  it('returns true when key has today date', () => {
    const today = createDateString(0)
    expect(isStackingHabitCompletedToday({ 'habit-1': [today] }, 'habit-1')).toBe(true)
  })

  it('returns false when key has only other dates', () => {
    const yesterday = createDateString(1)
    expect(isStackingHabitCompletedToday({ 'habit-1': [yesterday] }, 'habit-1')).toBe(false)
  })

  it('returns true when key has today and other dates', () => {
    const today = createDateString(0)
    const yesterday = createDateString(1)
    expect(isStackingHabitCompletedToday({ 'habit-1': [yesterday, today] }, 'habit-1')).toBe(true)
  })
})
