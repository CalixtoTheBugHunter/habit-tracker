import type { AppError, ErrorContext } from './errorTypes'

export const STORAGE_KEY = 'habit-tracker-errors'
export const MAX_STORED_ERRORS = 20

export interface StoredError {
  code: string
  userMessage: string
  technicalDetails?: string
  timestamp: string
  context?: ErrorContext
}

export function storeError(error: AppError): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return
    }

    const storedErrors = getStoredErrors()
    const newError: StoredError = {
      code: error.code,
      userMessage: error.userMessage,
      technicalDetails: error.technicalDetails,
      timestamp: error.timestamp.toISOString(),
      context: error.context,
    }

    storedErrors.unshift(newError)

    if (storedErrors.length > MAX_STORED_ERRORS) {
      storedErrors.splice(MAX_STORED_ERRORS)
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedErrors))
  } catch {
    // Silently fail if storage is unavailable or quota exceeded
  }
}

export function getStoredErrors(): StoredError[] {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return []
    }

    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    return JSON.parse(stored) as StoredError[]
  } catch {
    return []
  }
}

export function clearStoredErrors(): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return
    }

    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Silently fail if storage is unavailable
  }
}


