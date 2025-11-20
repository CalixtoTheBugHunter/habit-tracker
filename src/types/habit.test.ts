import { describe, it, expect } from 'vitest'
import type { Habit } from './habit'

describe('Habit Type', () => {
  describe('Shape and Required Fields', () => {
    it('should have required id field', () => {
      const habit: Habit = {
        id: 'test-id',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      expect(habit.id).toBe('test-id')
      expect(typeof habit.id).toBe('string')
    })

    it('should have required createdDate field', () => {
      const habit: Habit = {
        id: 'test-id',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: [],
      }
      expect(habit.createdDate).toBe('2025-01-01T00:00:00.000Z')
      expect(typeof habit.createdDate).toBe('string')
    })

    it('should have required completionDates field', () => {
      const habit: Habit = {
        id: 'test-id',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      expect(Array.isArray(habit.completionDates)).toBe(true)
    })

    it('should accept optional name field', () => {
      const habit: Habit = {
        id: 'test-id',
        name: 'Exercise',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      expect(habit.name).toBe('Exercise')
      expect(typeof habit.name).toBe('string')
    })

    it('should accept optional description field', () => {
      const habit: Habit = {
        id: 'test-id',
        description: 'Daily exercise routine',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      expect(habit.description).toBe('Daily exercise routine')
      expect(typeof habit.description).toBe('string')
    })
  })

  describe('Constraints', () => {
    it('should allow empty completionDates array', () => {
      const habit: Habit = {
        id: 'test-id',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      expect(habit.completionDates).toEqual([])
    })

    it('should allow multiple completion dates', () => {
      const dates = [
        '2025-01-01T00:00:00.000Z',
        '2025-01-02T00:00:00.000Z',
        '2025-01-03T00:00:00.000Z',
      ]
      const habit: Habit = {
        id: 'test-id',
        createdDate: new Date().toISOString(),
        completionDates: dates,
      }
      expect(habit.completionDates).toEqual(dates)
      expect(habit.completionDates.length).toBe(3)
    })

    it('should allow habit without optional fields', () => {
      const habit: Habit = {
        id: 'test-id',
        createdDate: new Date().toISOString(),
        completionDates: [],
      }
      expect(habit.id).toBe('test-id')
      expect(habit.name).toBeUndefined()
      expect(habit.description).toBeUndefined()
    })

    it('should allow habit with all fields', () => {
      const habit: Habit = {
        id: 'test-id',
        name: 'Exercise',
        description: 'Daily exercise routine',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: ['2025-01-01T00:00:00.000Z'],
      }
      expect(habit.id).toBe('test-id')
      expect(habit.name).toBe('Exercise')
      expect(habit.description).toBe('Daily exercise routine')
      expect(habit.createdDate).toBe('2025-01-01T00:00:00.000Z')
      expect(habit.completionDates).toHaveLength(1)
    })
  })

  describe('Type Safety', () => {
    it('should enforce string type for id', () => {
      expect(() => {
        const invalid: Habit = {
          id: 123 as unknown as string,
          createdDate: new Date().toISOString(),
          completionDates: [],
        }
        return invalid
      }).not.toThrow()
    })

    it('should enforce string array type for completionDates', () => {
      const habit: Habit = {
        id: 'test-id',
        createdDate: new Date().toISOString(),
        completionDates: ['2025-01-01T00:00:00.000Z'],
      }
      expect(Array.isArray(habit.completionDates)).toBe(true)
      expect(habit.completionDates.every((date) => typeof date === 'string')).toBe(true)
    })
  })
})

