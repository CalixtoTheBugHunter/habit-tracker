import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { openDB, getAllHabits, updateHabit, deleteHabit as deleteHabitFromDB } from '../services/indexedDB'
import { toggleCompletion } from '../utils/habit/toggleCompletion'
import type { Habit } from '../types/habit'

interface HabitContextType {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  refreshHabits: () => Promise<void>
  toggleHabitCompletion: (habitId: string) => Promise<void>
  deleteHabit: (habitId: string) => Promise<void>
}

const HabitContext = createContext<HabitContextType | undefined>(undefined)

export function useHabits() {
  const context = useContext(HabitContext)
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider')
  }
  return context
}

interface HabitProviderProps {
  children: ReactNode
}

export function HabitProvider({ children }: HabitProviderProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshHabits = useCallback(async () => {
    try {
      setError(null)
      const loadedHabits = await getAllHabits()
      setHabits(loadedHabits)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load habits'
      setError(errorMessage)
      throw err
    }
  }, [])

  const toggleHabitCompletion = useCallback(async (habitId: string) => {
    try {
      setError(null)
      const habit = habits.find(h => h.id === habitId)
      if (!habit) {
        throw new Error(`Habit with id ${habitId} not found`)
      }

      const updatedHabit = toggleCompletion(habit)
      await updateHabit(updatedHabit)
      await refreshHabits()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle habit completion'
      setError(errorMessage)
      throw err
    }
  }, [habits, refreshHabits])

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      setError(null)
      await deleteHabitFromDB(habitId)
      await refreshHabits()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit'
      setError(errorMessage)
      throw err
    }
  }, [refreshHabits])

  useEffect(() => {
    async function initializeApp() {
      try {
        setIsLoading(true)
        setError(null)
        await openDB()
        await refreshHabits()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize application'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [refreshHabits])

  const value: HabitContextType = useMemo(
    () => ({
      habits,
      isLoading,
      error,
      refreshHabits,
      toggleHabitCompletion,
      deleteHabit,
    }),
    [habits, isLoading, error, refreshHabits, toggleHabitCompletion, deleteHabit]
  )

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
}

