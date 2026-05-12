import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { useLanguage } from './LanguageContext'
import { openDB, getAllHabits, updateHabit as updateHabitInDB, deleteHabit as deleteHabitFromDB, putHabits } from '../services/indexedDB'
import { runMigrations, migrations } from '../services/migration'
import { toggleCompletion } from '../utils/habit/toggleCompletion'
import { stripTodayFromAutoCompletedDates } from '../utils/habit/checkAutoCompletion'
import { createAppError } from '../utils/error/errorTypes'
import { logError } from '../utils/error/errorLogger'
import type { Habit } from '../types/habit'
import { sortHabitsByDisplayOrder } from '../utils/habit/sortHabitsByDisplayOrder'

interface HabitContextType {
  habits: Habit[]
  activeHabits: Habit[]
  archivedHabits: Habit[]
  isLoading: boolean
  error: string | null
  refreshHabits: () => Promise<void>
  toggleHabitCompletion: (habitId: string) => Promise<void>
  updateHabit: (habit: Habit) => Promise<void>
  deleteHabit: (habitId: string) => Promise<void>
  reorderActiveHabits: (orderedIds: string[]) => Promise<void>
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

  const reorderActiveHabits = useCallback(
    async (orderedIds: string[]) => {
      try {
        setError(null)
        const active = habits.filter(h => !h.archivedAt)
        if (orderedIds.length !== active.length) {
          return
        }
        const activeIdSet = new Set(active.map(h => h.id))
        if (!orderedIds.every(id => activeIdSet.has(id))) {
          return
        }
        const byId = new Map(habits.map(h => [h.id, h]))
        const updated: Habit[] = orderedIds.map((id, index) => {
          const h = byId.get(id)
          if (!h) {
            throw new Error(`Habit ${id} not found`)
          }
          return { ...h, sortOrder: index }
        })
        const anyChanged = updated.some(h => byId.get(h.id)?.sortOrder !== h.sortOrder)
        if (!anyChanged) {
          return
        }
        await putHabits(updated)
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
    },
    [habits, messages.app.updateHabitError, refreshHabits]
  )

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

  const activeHabits = useMemo(() => {
    const active = habits.filter(h => !h.archivedAt)
    return sortHabitsByDisplayOrder(active)
  }, [habits])
  const archivedHabits = useMemo(() => {
    const archived = habits.filter(h => !!h.archivedAt)
    return sortHabitsByDisplayOrder(archived)
  }, [habits])

  const value: HabitContextType = useMemo(
    () => ({
      habits,
      activeHabits,
      archivedHabits,
      isLoading,
      error,
      refreshHabits,
      toggleHabitCompletion,
      updateHabit,
      deleteHabit,
      reorderActiveHabits,
    }),
    [
      habits,
      activeHabits,
      archivedHabits,
      isLoading,
      error,
      refreshHabits,
      toggleHabitCompletion,
      updateHabit,
      deleteHabit,
      reorderActiveHabits,
    ]
  )

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
}

