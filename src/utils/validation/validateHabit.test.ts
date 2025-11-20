import { describe, it, expect } from 'vitest'
import { validateHabit } from './validateHabit'
import type { Habit } from '../../types/habit'

describe('validateHabit', () => {
  describe('valid habits', () => {
    it('should validate habit with all required fields', () => {
      const habit: Habit = {
        id: '1',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }
      expect(() => validateHabit(habit)).not.toThrow()
    })

    it('should validate habit with all fields', () => {
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        description: 'Daily exercise routine',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: ['2025-01-01T00:00:00.000Z'],
      }
      expect(() => validateHabit(habit)).not.toThrow()
    })

    it('should validate habit with multiple completion dates', () => {
      const habit: Habit = {
        id: '1',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [
          '2025-01-01T00:00:00.000Z',
          '2025-01-02T00:00:00.000Z',
        ],
      }
      expect(() => validateHabit(habit)).not.toThrow()
    })
  })

  describe('invalid habits', () => {
    it('should reject non-object values', () => {
      expect(() => validateHabit(null)).toThrow('Habit must be an object')
      expect(() => validateHabit(undefined)).toThrow('Habit must be an object')
      expect(() => validateHabit('string')).toThrow('Habit must be an object')
      expect(() => validateHabit(123)).toThrow('Habit must be an object')
    })

    it('should reject habit without id', () => {
      const invalid = {
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }
      expect(() => validateHabit(invalid)).toThrow('Habit must have a non-empty string id')
    })

    it('should reject habit with empty id', () => {
      const invalid = {
        id: '',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }
      expect(() => validateHabit(invalid)).toThrow('Habit must have a non-empty string id')
    })

    it('should reject habit without createdDate', () => {
      const invalid = {
        id: '1',
        completionDates: [],
      }
      expect(() => validateHabit(invalid)).toThrow('Habit must have a non-empty string createdDate')
    })

    it('should reject habit with invalid ISO 8601 createdDate', () => {
      const invalid = {
        id: '1',
        createdDate: 'not-a-date',
        completionDates: [],
      }
      expect(() => validateHabit(invalid)).toThrow('Habit createdDate must be a valid ISO 8601 date string')
    })

    it('should reject habit without completionDates', () => {
      const invalid = {
        id: '1',
        createdDate: '2025-01-01T00:00:00.000Z',
      }
      expect(() => validateHabit(invalid)).toThrow('Habit must have a completionDates array')
    })

    it('should reject habit with non-array completionDates', () => {
      const invalid = {
        id: '1',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: 'not-an-array',
      }
      expect(() => validateHabit(invalid)).toThrow('Habit must have a completionDates array')
    })

    it('should reject habit with non-string completion dates', () => {
      const invalid = {
        id: '1',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [123, 456],
      }
      expect(() => validateHabit(invalid)).toThrow('All completionDates must be strings')
    })

    it('should reject habit with invalid ISO 8601 completion dates', () => {
      const invalid = {
        id: '1',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: ['not-a-date'],
      }
      expect(() => validateHabit(invalid)).toThrow('All completionDates must be valid ISO 8601 date strings')
    })

    it('should reject habit with non-string name', () => {
      const invalid = {
        id: '1',
        name: 123,
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }
      expect(() => validateHabit(invalid)).toThrow('Habit field "name" must be a string if provided')
    })

    it('should reject habit with non-string description', () => {
      const invalid = {
        id: '1',
        description: 123,
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }
      expect(() => validateHabit(invalid)).toThrow('Habit field "description" must be a string if provided')
    })

    it('should reject habit with name exceeding max length', () => {
      const invalid = {
        id: '1',
        name: 'a'.repeat(256),
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }
      expect(() => validateHabit(invalid)).toThrow('Habit name must not exceed 255 characters')
    })

    it('should reject habit with description exceeding max length', () => {
      const invalid = {
        id: '1',
        description: 'a'.repeat(5001),
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }
      expect(() => validateHabit(invalid)).toThrow('Habit description must not exceed 5000 characters')
    })

    it('should reject habit exceeding max size', () => {
      // Create a habit that exceeds max size but doesn't trigger length checks
      // by using a large completionDates array
      const invalid = {
        id: '1',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: Array(10000).fill('2025-01-01T00:00:00.000Z'),
      }
      expect(() => validateHabit(invalid)).toThrow('Habit data exceeds maximum size')
    })
  })
})

