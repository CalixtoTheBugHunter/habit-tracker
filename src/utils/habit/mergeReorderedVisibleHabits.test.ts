import { describe, it, expect } from 'vitest'
import { mergeReorderedVisibleHabits } from './mergeReorderedVisibleHabits'

describe('mergeReorderedVisibleHabits', () => {
  const active = ['h0', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7']

  it('returns the reordered list unchanged when every habit is visible', () => {
    const reordered = ['h2', 'h0', 'h1', 'h3', 'h4', 'h5', 'h6', 'h7']
    expect(mergeReorderedVisibleHabits(active, reordered)).toEqual(reordered)
  })

  it('reorders only the visible slots and keeps hidden habits fixed', () => {
    // Visible subset occupies slots 1, 3, 6: [h1, h3, h6] -> reordered [h6, h1, h3]
    const reorderedVisible = ['h6', 'h1', 'h3']
    expect(mergeReorderedVisibleHabits(active, reorderedVisible)).toEqual([
      'h0',
      'h6',
      'h2',
      'h1',
      'h4',
      'h5',
      'h3',
      'h7',
    ])
  })

  it('preserves the full length of the active ordering', () => {
    const result = mergeReorderedVisibleHabits(active, ['h6', 'h1', 'h3'])
    expect(result).toHaveLength(active.length)
    expect([...result].sort()).toEqual([...active].sort())
  })

  it('returns the active order untouched when nothing is visible', () => {
    expect(mergeReorderedVisibleHabits(active, [])).toEqual(active)
  })
})
