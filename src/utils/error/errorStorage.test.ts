import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  storeError,
  getStoredErrors,
  clearStoredErrors,
  STORAGE_KEY,
  MAX_STORED_ERRORS,
} from './errorStorage'
import { AppError } from './errorTypes'

describe('errorStorage', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear()
    }
  })

  describe('storeError', () => {
    it('should store error in sessionStorage', () => {
      const error = new AppError('UNKNOWN_ERROR', 'Test message')
      storeError(error)

      const stored = window.sessionStorage.getItem(STORAGE_KEY)
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].code).toBe('UNKNOWN_ERROR')
      expect(parsed[0].userMessage).toBe('Test message')
      expect(parsed[0].timestamp).toBeTruthy()
    })

    it('should store error with technical details and context', () => {
      const error = new AppError(
        'UNKNOWN_ERROR',
        'Test message',
        'Technical details',
        { key: 'value' }
      )
      storeError(error)

      const stored = getStoredErrors()
      expect(stored[0]?.technicalDetails).toBe('Technical details')
      expect(stored[0]?.context).toEqual({ key: 'value' })
    })

    it('should prepend new errors to the array', () => {
      const error1 = new AppError('UNKNOWN_ERROR', 'First error')
      const error2 = new AppError('VALIDATION_ERROR', 'Second error')

      storeError(error1)
      storeError(error2)

      const stored = getStoredErrors()
      expect(stored).toHaveLength(2)
      expect(stored[0]?.userMessage).toBe('Second error')
      expect(stored[1]?.userMessage).toBe('First error')
    })

    it('should limit stored errors to MAX_STORED_ERRORS', () => {
      for (let i = 0; i < MAX_STORED_ERRORS + 5; i++) {
        const error = new AppError('UNKNOWN_ERROR', `Error ${i}`)
        storeError(error)
      }

      const stored = getStoredErrors()
      expect(stored).toHaveLength(MAX_STORED_ERRORS)
      expect(stored[0]?.userMessage).toBe(`Error ${MAX_STORED_ERRORS + 4}`)
      expect(stored[MAX_STORED_ERRORS - 1]?.userMessage).toBe('Error 5')
    })

    it('should handle storage errors gracefully', () => {
      const error = new AppError('UNKNOWN_ERROR', 'Test message')
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => storeError(error)).not.toThrow()
      setItemSpy.mockRestore()
    })

    it('should handle quota exceeded errors gracefully', () => {
      const error = new AppError('UNKNOWN_ERROR', 'Test message')
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')
        throw quotaError
      })

      expect(() => storeError(error)).not.toThrow()
      setItemSpy.mockRestore()
    })
  })

  describe('getStoredErrors', () => {
    it('should return empty array when no errors stored', () => {
      const stored = getStoredErrors()
      expect(stored).toEqual([])
    })

    it('should return stored errors', () => {
      const error1 = new AppError('UNKNOWN_ERROR', 'First error')
      const error2 = new AppError('VALIDATION_ERROR', 'Second error')

      storeError(error1)
      storeError(error2)

      const stored = getStoredErrors()
      expect(stored).toHaveLength(2)
      expect(stored[0]?.userMessage).toBe('Second error')
      expect(stored[1]?.userMessage).toBe('First error')
    })

    it('should handle invalid JSON gracefully', () => {
      window.sessionStorage.setItem(STORAGE_KEY, 'invalid json')

      const stored = getStoredErrors()
      expect(stored).toEqual([])
    })

    it('should handle storage errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const stored = getStoredErrors()
      expect(stored).toEqual([])
      getItemSpy.mockRestore()
    })
  })

  describe('clearStoredErrors', () => {
    it('should clear stored errors', () => {
      const error = new AppError('UNKNOWN_ERROR', 'Test message')
      storeError(error)

      expect(getStoredErrors()).toHaveLength(1)

      clearStoredErrors()

      expect(getStoredErrors()).toHaveLength(0)
      expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('should handle storage errors gracefully', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => clearStoredErrors()).not.toThrow()
      removeItemSpy.mockRestore()
    })
  })
})


