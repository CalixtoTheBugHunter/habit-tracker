import { describe, it, expect } from 'vitest'
import { isQuotaExceededError } from './isQuotaExceededError'

describe('isQuotaExceededError', () => {
  describe('quota exceeded errors', () => {
    it('should return true for DOMException with QuotaExceededError name', () => {
      const error = new DOMException('Quota exceeded', 'QuotaExceededError')
      expect(isQuotaExceededError(error)).toBe(true)
    })

    it('should return true for DOMException with NS_ERROR_DOM_QUOTA_REACHED name', () => {
      const error = new DOMException('Quota reached', 'NS_ERROR_DOM_QUOTA_REACHED')
      expect(isQuotaExceededError(error)).toBe(true)
    })

    it('should return true for error-like object with code 22', () => {
      // Test the code 22 check for non-DOMException error-like objects
      const error = {
        code: 22,
        message: 'Quota exceeded',
      }
      expect(isQuotaExceededError(error)).toBe(true)
    })
  })

  describe('non-quota errors', () => {
    it('should return false for regular Error', () => {
      const error = new Error('Some error')
      expect(isQuotaExceededError(error)).toBe(false)
    })

    it('should return false for DOMException with different name', () => {
      const error = new DOMException('Some error', 'NotFoundError')
      expect(isQuotaExceededError(error)).toBe(false)
    })

    it('should return false for error with different code', () => {
      // Create a mock error object with a different code
      const error = {
        name: 'SomeError',
        message: 'Some error',
        code: 1,
      } as unknown as DOMException
      expect(isQuotaExceededError(error)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isQuotaExceededError(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isQuotaExceededError(undefined)).toBe(false)
    })

    it('should return false for string', () => {
      expect(isQuotaExceededError('error')).toBe(false)
    })
  })
})

