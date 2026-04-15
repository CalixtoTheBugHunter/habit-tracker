import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { useLanguage } from './LanguageContext'
import { openDB, getAllHabits, updateHabit as updateHabitInDB, deleteHabit as deleteHabitFromDB } from '../services/indexedDB'
import { runMigrations, migrations } from '../services/migration'
import { toggleCompletion } from '../utils/habit/toggleCompletion'
import { stripTodayFromAutoCompletedDates } from '../utils/habit/checkAutoCompletion'
import { createAppError } from '../utils/error/errorTypes'
import { logError } from '../utils/error/errorLogger'
import type { Habit } from '../types/habit'

interface HabitContextType {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  refreshHabits: () => Promise<void>
  toggleHabitCompletion: (habitId: string) => Promise<void>
  updateHabit: (habit: Habit) => Promise<void>
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
  const { messages } = useLanguage()
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshHabits = useCallback(async () => {
    try {
      setError(null)
      const loadedHabits = await getAllHabits()
      setHabits(loadedHabits)
    } catch (err) {
      const appError = createAppError(
        err,
        'UNKNOWN_ERROR',
        messages.app.loadHabitsError
      )
      logError(appError)
      setError(appError.userMessage)
      throw err
    }
  }, [messages.app.loadHabitsError])

  const updateHabit = useCallback(async (habit: Habit) => {
    try {
      setError(null)
      await updateHabitInDB(habit)
      await refreshHabits()
    } catch (err) {
      const appError = createAppError(
        err,
        'UNKNOWN_ERROR',
        messages.app.updateHabitError
      )
      logError(appError)
      setError(appError.userMessage)
      throw err
    }
  }, [messages.app.updateHabitError, refreshHabits])

  const toggleHabitCompletion = useCallback(async (habitId: string) => {
    try {
      setError(null)
      const habit = habits.find(h => h.id === habitId)
      if (!habit) {
        throw new Error(`Habit with id ${habitId} not found`)
      }

      const updatedHabit = stripTodayFromAutoCompletedDates(toggleCompletion(habit))
      await updateHabit(updatedHabit)
      await refreshHabits()
    } catch (err) {
      const appError = createAppError(
        err,
        'UNKNOWN_ERROR',
        messages.app.toggleCompletionError
      )
      logError(appError)
      setError(appError.userMessage)
      throw err
    }
  }, [habits, messages.app.toggleCompletionError, refreshHabits, updateHabit])

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      setError(null)
      await deleteHabitFromDB(habitId)
      await refreshHabits()
    } catch (err) {
      const appError = createAppError(
        err,
        'UNKNOWN_ERROR',
        messages.app.deleteHabitError
      )
      logError(appError)
      setError(appError.userMessage)
      throw err
    }
  }, [messages.app.deleteHabitError, refreshHabits])

  useEffect(() => {
    async function initializeApp() {
      try {
        setIsLoading(true)
        setError(null)
        const db = await openDB()
        await runMigrations(db, migrations)
        await refreshHabits()
      } catch (err) {
        const appError = createAppError(
          err,
          'UNKNOWN_ERROR',
          messages.app.initError
        )
        logError(appError)
        setError(appError.userMessage)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [messages.app.initError, refreshHabits])

  const value: HabitContextType = useMemo(
    () => ({
      habits,
      isLoading,
      error,
      refreshHabits,
      toggleHabitCompletion,
      updateHabit,
      deleteHabit,
    }),
    [habits, isLoading, error, refreshHabits, toggleHabitCompletion, updateHabit, deleteHabit]
  )

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
}

