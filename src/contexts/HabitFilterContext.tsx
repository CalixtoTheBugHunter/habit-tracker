import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import {
  DEFAULT_HABIT_FILTER_CRITERIA,
  type HabitFilterCriteria,
  type CompletionStatusFilter,
  type StreakRangeFilter,
  type HabitSortBy,
} from '../types/habitFilter'
import { loadHabitFilterCriteria, saveHabitFilterCriteria } from '../services/habitFilterStorage'

interface HabitFilterContextType {
  criteria: HabitFilterCriteria
  setSearchQuery: (query: string) => void
  setCompletionStatus: (status: CompletionStatusFilter) => void
  setStreakRange: (range: StreakRangeFilter) => void
  setSortBy: (sortBy: HabitSortBy) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

const HabitFilterContext = createContext<HabitFilterContextType | undefined>(undefined)

export function useHabitFilter() {
  const context = useContext(HabitFilterContext)
  if (context === undefined) {
    throw new Error('useHabitFilter must be used within a HabitFilterProvider')
  }
  return context
}

interface HabitFilterProviderProps {
  children: ReactNode
}

/** Debounce persistence so typing in the search field doesn't write on every keystroke. */
const SAVE_DEBOUNCE_MS = 300

export function HabitFilterProvider({ children }: HabitFilterProviderProps) {
  const [criteria, setCriteria] = useState<HabitFilterCriteria>(() => loadHabitFilterCriteria())

  useEffect(() => {
    const handle = window.setTimeout(() => saveHabitFilterCriteria(criteria), SAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [criteria])

  const setSearchQuery = useCallback((searchQuery: string) => {
    setCriteria(prev => ({ ...prev, searchQuery }))
  }, [])

  const setCompletionStatus = useCallback((completionStatus: CompletionStatusFilter) => {
    setCriteria(prev => ({ ...prev, completionStatus }))
  }, [])

  const setStreakRange = useCallback((streakRange: StreakRangeFilter) => {
    setCriteria(prev => ({ ...prev, streakRange }))
  }, [])

  const setSortBy = useCallback((sortBy: HabitSortBy) => {
    setCriteria(prev => ({ ...prev, sortBy }))
  }, [])

  const clearFilters = useCallback(() => {
    setCriteria({ ...DEFAULT_HABIT_FILTER_CRITERIA })
  }, [])

  const hasActiveFilters =
    criteria.searchQuery.trim() !== '' ||
    criteria.completionStatus !== DEFAULT_HABIT_FILTER_CRITERIA.completionStatus ||
    criteria.streakRange !== DEFAULT_HABIT_FILTER_CRITERIA.streakRange ||
    criteria.sortBy !== DEFAULT_HABIT_FILTER_CRITERIA.sortBy

  const value: HabitFilterContextType = useMemo(
    () => ({
      criteria,
      setSearchQuery,
      setCompletionStatus,
      setStreakRange,
      setSortBy,
      clearFilters,
      hasActiveFilters,
    }),
    [
      criteria,
      setSearchQuery,
      setCompletionStatus,
      setStreakRange,
      setSortBy,
      clearFilters,
      hasActiveFilters,
    ]
  )

  return <HabitFilterContext.Provider value={value}>{children}</HabitFilterContext.Provider>
}
