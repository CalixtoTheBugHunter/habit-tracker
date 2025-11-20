import { describe, it, expect } from 'vitest'
import { validateId } from './validateId'

describe('validateId', () => {
  describe('valid IDs', () => {
    it.each([
      ['1'],
      ['test-id'],
      ['habit-123'],
      ['a'],
      ['1234567890'],
    ])('should validate valid ID: %s', (id) => {
      expect(() => validateId(id)).not.toThrow()
    })
  })

  describe('invalid IDs', () => {
    it('should reject null', () => {
      expect(() => validateId(null)).toThrow('Habit id must be a non-empty string')
    })

    it('should reject undefined', () => {
      expect(() => validateId(undefined)).toThrow('Habit id must be a non-empty string')
    })

    it('should reject empty string', () => {
      expect(() => validateId('')).toThrow('Habit id must be a non-empty string')
    })

    it('should reject whitespace-only string', () => {
      expect(() => validateId('   ')).toThrow('Habit id must be a non-empty string')
      expect(() => validateId('\t')).toThrow('Habit id must be a non-empty string')
      expect(() => validateId('\n')).toThrow('Habit id must be a non-empty string')
    })

    it('should reject non-string types', () => {
      expect(() => validateId(123)).toThrow('Habit id must be a non-empty string')
      expect(() => validateId(true)).toThrow('Habit id must be a non-empty string')
      expect(() => validateId({})).toThrow('Habit id must be a non-empty string')
      expect(() => validateId([])).toThrow('Habit id must be a non-empty string')
    })
  })
})

