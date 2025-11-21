import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { openDB, getAllHabits } from '../services/indexedDB'
import type { Habit } from '../types/habit'

interface HabitContextType {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  refreshHabits: () => Promise<void>
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

  const refreshHabits = async () => {
    try {
      setError(null)
      const loadedHabits = await getAllHabits()
      setHabits(loadedHabits)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load habits'
      setError(errorMessage)
      throw err
    }
  }

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
  }, [])

  const value: HabitContextType = {
    habits,
    isLoading,
    error,
    refreshHabits,
  }

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
}

