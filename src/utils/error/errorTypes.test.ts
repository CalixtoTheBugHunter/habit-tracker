import { describe, it, expect } from 'vitest'
import {
  AppError,
  IndexedDBError,
  ReactError,
  ValidationError,
  UnknownError,
  createAppError,
  isAppError,
} from './errorTypes'

describe('errorTypes', () => {
  describe('AppError', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError(
        'UNKNOWN_ERROR',
        'Test message',
        'Technical details',
        { key: 'value' }
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.userMessage).toBe('Test message')
      expect(error.technicalDetails).toBe('Technical details')
      expect(error.context).toEqual({ key: 'value' })
      expect(error.timestamp).toBeInstanceOf(Date)
      expect(error.name).toBe('AppError')
      expect(error.message).toBe('Test message')
    })

    it('should create AppError with minimal properties', () => {
      const error = new AppError('UNKNOWN_ERROR', 'Test message')

      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.userMessage).toBe('Test message')
      expect(error.technicalDetails).toBeUndefined()
      expect(error.context).toBeUndefined()
    })
  })

  describe('IndexedDBError', () => {
    it('should create IndexedDBError extending AppError', () => {
      const error = new IndexedDBError(
        'INDEXEDDB_OPEN_FAILED',
        'Test message',
        'Technical details'
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(IndexedDBError)
      expect(error.name).toBe('IndexedDBError')
      expect(error.code).toBe('INDEXEDDB_OPEN_FAILED')
      expect(error.userMessage).toBe('Test message')
    })
  })

  describe('ReactError', () => {
    it('should create ReactError extending AppError', () => {
      const error = new ReactError(
        'REACT_RENDER_ERROR',
        'Test message',
        'Technical details'
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(ReactError)
      expect(error.name).toBe('ReactError')
      expect(error.code).toBe('REACT_RENDER_ERROR')
      expect(error.userMessage).toBe('Test message')
    })
  })

  describe('ValidationError', () => {
    it('should create ValidationError extending AppError', () => {
      const error = new ValidationError(
        'VALIDATION_ERROR',
        'Test message',
        'Technical details'
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.name).toBe('ValidationError')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.userMessage).toBe('Test message')
    })
  })

  describe('UnknownError', () => {
    it('should create UnknownError extending AppError', () => {
      const error = new UnknownError(
        'UNKNOWN_ERROR',
        'Test message',
        'Technical details'
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(UnknownError)
      expect(error.name).toBe('UnknownError')
      expect(error.code).toBe('UNKNOWN_ERROR')
      expect(error.userMessage).toBe('Test message')
    })
  })

  describe('createAppError', () => {
    it('should return AppError instance if error is already AppError', () => {
      const originalError = new AppError(
        'UNKNOWN_ERROR',
        'Original message'
      )
      const result = createAppError(originalError)

      expect(result).toBe(originalError)
      expect(result).toBeInstanceOf(AppError)
    })

    it('should create UnknownError from Error instance', () => {
      const error = new Error('Test error')
      const result = createAppError(error)

      expect(result).toBeInstanceOf(UnknownError)
      expect(result).toBeInstanceOf(AppError)
      expect(result.userMessage).toBe('An unexpected error occurred. Please refresh the page.')
      expect(result.technicalDetails).toBe(error.stack)
    })

    it('should create UnknownError from string', () => {
      const error = 'String error'
      const result = createAppError(error)

      expect(result).toBeInstanceOf(UnknownError)
      expect(result.userMessage).toBe('An unexpected error occurred. Please refresh the page.')
      expect(result.technicalDetails).toBe('String error')
    })

    it('should create UnknownError with custom code and message', () => {
      const error = new Error('Test error')
      const result = createAppError(
        error,
        'VALIDATION_ERROR',
        'Custom message'
      )

      expect(result).toBeInstanceOf(UnknownError)
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.userMessage).toBe('Custom message')
    })

    it('should create UnknownError with context', () => {
      const error = new Error('Test error')
      const context = { userId: '123', action: 'save' }
      const result = createAppError(error, 'UNKNOWN_ERROR', 'Message', context)

      expect(result.context).toEqual(context)
    })

    it('should handle null error', () => {
      const result = createAppError(null)

      expect(result).toBeInstanceOf(UnknownError)
      expect(result.userMessage).toBe('An unexpected error occurred. Please refresh the page.')
    })

    it('should handle undefined error', () => {
      const result = createAppError(undefined)

      expect(result).toBeInstanceOf(UnknownError)
      expect(result.userMessage).toBe('An unexpected error occurred. Please refresh the page.')
    })
  })

  describe('isAppError', () => {
    it('should return true for AppError instance', () => {
      const error = new AppError('UNKNOWN_ERROR', 'Test')
      expect(isAppError(error)).toBe(true)
    })

    it('should return true for IndexedDBError instance', () => {
      const error = new IndexedDBError('INDEXEDDB_OPEN_FAILED', 'Test')
      expect(isAppError(error)).toBe(true)
    })

    it('should return true for ReactError instance', () => {
      const error = new ReactError('REACT_RENDER_ERROR', 'Test')
      expect(isAppError(error)).toBe(true)
    })

    it('should return false for Error instance', () => {
      const error = new Error('Test')
      expect(isAppError(error)).toBe(false)
    })

    it('should return false for string', () => {
      expect(isAppError('error')).toBe(false)
    })

    it('should return false for null', () => {
      expect(isAppError(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isAppError(undefined)).toBe(false)
    })
  })
})


