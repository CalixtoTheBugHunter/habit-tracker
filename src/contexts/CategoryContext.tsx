import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { useLanguage } from './LanguageContext'
import { useHabits } from './HabitContext'
import {
  getAllCategories,
  addCategory as addCategoryToDB,
  updateCategory as updateCategoryInDB,
  deleteCategory as deleteCategoryFromDB,
} from '../services/indexedDB'
import { createAppError } from '../utils/error/errorTypes'
import { logError } from '../utils/error/errorLogger'
import type { Category } from '../types/category'

interface CategoryContextType {
  categories: Category[]
  isLoading: boolean
  error: string | null
  selectedCategoryIds: string[]
  refreshCategories: () => Promise<void>
  addCategory: (name: string) => Promise<void>
  updateCategory: (category: Category) => Promise<void>
  deleteCategory: (categoryId: string) => Promise<void>
  toggleCategoryFilter: (categoryId: string) => void
  clearCategoryFilter: () => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}

interface CategoryProviderProps {
  children: ReactNode
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const { messages } = useLanguage()
  const { removeCategoryFromHabits } = useHabits()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const refreshCategories = useCallback(async () => {
    try {
      setError(null)
      const loaded = await getAllCategories()
      setCategories(Array.isArray(loaded) ? loaded : [])
    } catch (err) {
      const appError = createAppError(err, 'UNKNOWN_ERROR', messages.categories.loadError)
      logError(appError)
      setError(appError.userMessage)
      setCategories([])
    }
  }, [messages.categories.loadError])

  const addCategory = useCallback(
    async (name: string) => {
      try {
        setError(null)
        const category: Category = {
          id: globalThis.crypto.randomUUID(),
          name: name.trim(),
          createdDate: new Date().toISOString(),
        }
        await addCategoryToDB(category)
        await refreshCategories()
      } catch (err) {
        const appError = createAppError(err, 'UNKNOWN_ERROR', messages.categories.saveError)
        logError(appError)
        setError(appError.userMessage)
        throw err
      }
    },
    [messages.categories.saveError, refreshCategories]
  )

  const updateCategory = useCallback(
    async (category: Category) => {
      try {
        setError(null)
        await updateCategoryInDB({ ...category, name: category.name.trim() })
        await refreshCategories()
      } catch (err) {
        const appError = createAppError(err, 'UNKNOWN_ERROR', messages.categories.saveError)
        logError(appError)
        setError(appError.userMessage)
        throw err
      }
    },
    [messages.categories.saveError, refreshCategories]
  )

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      try {
        setError(null)
        // Strip the category from habits first so a failure here leaves the
        // category intact and the delete retryable, rather than orphaning
        // habit references to an already-deleted category.
        await removeCategoryFromHabits(categoryId)
        await deleteCategoryFromDB(categoryId)
        setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId))
        await refreshCategories()
      } catch (err) {
        const appError = createAppError(err, 'UNKNOWN_ERROR', messages.categories.deleteError)
        logError(appError)
        setError(appError.userMessage)
        throw err
      }
    },
    [messages.categories.deleteError, refreshCategories, removeCategoryFromHabits]
  )

  const toggleCategoryFilter = useCallback((categoryId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }, [])

  const clearCategoryFilter = useCallback(() => {
    setSelectedCategoryIds([])
  }, [])

  useEffect(() => {
    async function initializeCategories() {
      setIsLoading(true)
      await refreshCategories()
      setIsLoading(false)
    }

    initializeCategories()
  }, [refreshCategories])

  const value: CategoryContextType = useMemo(
    () => ({
      categories,
      isLoading,
      error,
      selectedCategoryIds,
      refreshCategories,
      addCategory,
      updateCategory,
      deleteCategory,
      toggleCategoryFilter,
      clearCategoryFilter,
    }),
    [
      categories,
      isLoading,
      error,
      selectedCategoryIds,
      refreshCategories,
      addCategory,
      updateCategory,
      deleteCategory,
      toggleCategoryFilter,
      clearCategoryFilter,
    ]
  )

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}
