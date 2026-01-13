import { describe, it, expect, beforeEach, vi } from 'vitest'
import { logError, logWarning } from './errorLogger'
import { AppError, IndexedDBError } from './errorTypes'
import { getStoredErrors } from './errorStorage'

describe('errorLogger', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear()
    }
    vi.clearAllMocks()
  })

  describe('logError', () => {
    it('should log error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new AppError('UNKNOWN_ERROR', 'Test message')

      logError(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('[UNKNOWN_ERROR] Test message')
      consoleErrorSpy.mockRestore()
    })

    it('should log error with context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new AppError('UNKNOWN_ERROR', 'Test message')
      const context = { userId: '123', action: 'save' }

      logError(error, context)

      expect(consoleErrorSpy).toHaveBeenCalledWith('[UNKNOWN_ERROR] Test message', context)
      consoleErrorSpy.mockRestore()
    })

    it('should store error in sessionStorage', () => {
      const error = new AppError('UNKNOWN_ERROR', 'Test message')

      logError(error)

      const stored = getStoredErrors()
      expect(stored).toHaveLength(1)
      expect(stored[0]?.code).toBe('UNKNOWN_ERROR')
      expect(stored[0]?.userMessage).toBe('Test message')
    })

    it('should handle IndexedDBError', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new IndexedDBError(
        'INDEXEDDB_OPEN_FAILED',
        'Unable to access storage'
      )

      logError(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[INDEXEDDB_OPEN_FAILED] Unable to access storage'
      )
      consoleErrorSpy.mockRestore()
    })
  })

  describe('logWarning', () => {
    it('should log warning to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new AppError('VALIDATION_ERROR', 'Warning message')

      logWarning(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('[VALIDATION_ERROR] Warning message')
      consoleErrorSpy.mockRestore()
    })

    it('should log warning with context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new AppError('VALIDATION_ERROR', 'Warning message')
      const context = { field: 'name' }

      logWarning(error, context)

      expect(consoleErrorSpy).toHaveBeenCalledWith('[VALIDATION_ERROR] Warning message', context)
      consoleErrorSpy.mockRestore()
    })

    it('should store warning in sessionStorage', () => {
      const error = new AppError('VALIDATION_ERROR', 'Warning message')

      logWarning(error)

      const stored = getStoredErrors()
      expect(stored).toHaveLength(1)
      expect(stored[0]?.code).toBe('VALIDATION_ERROR')
      expect(stored[0]?.userMessage).toBe('Warning message')
    })
  })

  describe('error storage integration', () => {
    it('should store multiple errors', () => {
      const error1 = new AppError('UNKNOWN_ERROR', 'First error')
      const error2 = new AppError('VALIDATION_ERROR', 'Second error')

      logError(error1)
      logError(error2)

      const stored = getStoredErrors()
      expect(stored).toHaveLength(2)
    })

    it('should handle storage failures gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const error = new AppError('UNKNOWN_ERROR', 'Test message')

      expect(() => logError(error)).not.toThrow()
      expect(consoleErrorSpy).toHaveBeenCalled()

      setItemSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })
})


