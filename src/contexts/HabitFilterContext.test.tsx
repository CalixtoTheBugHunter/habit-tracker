import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { HabitFilterProvider, useHabitFilter } from './HabitFilterContext'
import { DEFAULT_HABIT_FILTER_CRITERIA } from '../types/habitFilter'
import { loadHabitFilterCriteria } from '../services/habitFilterStorage'

function wrapper({ children }: { children: ReactNode }) {
  return <HabitFilterProvider>{children}</HabitFilterProvider>
}

describe('HabitFilterContext', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts with the default criteria', () => {
    const { result } = renderHook(() => useHabitFilter(), { wrapper })
    expect(result.current.criteria).toEqual(DEFAULT_HABIT_FILTER_CRITERIA)
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('updates each field via its setter', () => {
    const { result } = renderHook(() => useHabitFilter(), { wrapper })

    act(() => result.current.setSearchQuery('run'))
    act(() => result.current.setCompletionStatus('completed-today'))
    act(() => result.current.setStreakRange('1-7'))
    act(() => result.current.setSortBy('name'))

    expect(result.current.criteria).toEqual({
      searchQuery: 'run',
      completionStatus: 'completed-today',
      streakRange: '1-7',
      sortBy: 'name',
    })
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('resets everything with clearFilters', () => {
    const { result } = renderHook(() => useHabitFilter(), { wrapper })

    act(() => result.current.setSearchQuery('run'))
    act(() => result.current.setSortBy('streak'))
    act(() => result.current.clearFilters())

    expect(result.current.criteria).toEqual(DEFAULT_HABIT_FILTER_CRITERIA)
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('treats a whitespace-only search as no active filter', () => {
    const { result } = renderHook(() => useHabitFilter(), { wrapper })
    act(() => result.current.setSearchQuery('   '))
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('persists criteria changes to localStorage', () => {
    const { result } = renderHook(() => useHabitFilter(), { wrapper })
    act(() => result.current.setSortBy('streak'))
    expect(loadHabitFilterCriteria().sortBy).toBe('streak')
  })

  it('initializes from persisted localStorage criteria', () => {
    window.localStorage.setItem(
      'habitFilterCriteria',
      JSON.stringify({
        searchQuery: 'water',
        completionStatus: 'active-streak',
        streakRange: '30+',
        sortBy: 'name',
      })
    )
    const { result } = renderHook(() => useHabitFilter(), { wrapper })
    expect(result.current.criteria).toEqual({
      searchQuery: 'water',
      completionStatus: 'active-streak',
      streakRange: '30+',
      sortBy: 'name',
    })
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useHabitFilter())).toThrow(
      'useHabitFilter must be used within a HabitFilterProvider'
    )
  })
})
