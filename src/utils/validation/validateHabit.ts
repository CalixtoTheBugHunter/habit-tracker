import type { Habit } from '../../types/habit'
import { isValidISO8601 } from '../date/isValidISO8601'

export const MAX_NAME_LENGTH = 255
export const MAX_DESCRIPTION_LENGTH = 5000
const MAX_HABIT_SIZE = 100000

/**
 * Validates that an unknown value is a valid Habit object.
 * 
 * This function performs comprehensive validation including:
 * - Type checks for all required fields
 * - ISO 8601 date format validation for dates
 * - String length constraints for name and description
 * - Overall size constraints
 * 
 * @param habit - The value to validate
 * @throws Error if the value is not a valid Habit
 */
export function validateHabit(habit: unknown): asserts habit is Habit {
  if (!habit || typeof habit !== 'object') {
    throw new Error('Habit must be an object')
  }
  const habitObj = habit as Record<string, unknown>
  
  if (!habitObj.id || typeof habitObj.id !== 'string' || habitObj.id.trim() === '') {
    throw new Error('Habit must have a non-empty string id')
  }
  
  if (!habitObj.createdDate || typeof habitObj.createdDate !== 'string' || habitObj.createdDate.trim() === '') {
    throw new Error('Habit must have a non-empty string createdDate')
  }
  
  if (!isValidISO8601(habitObj.createdDate)) {
    throw new Error('Habit createdDate must be a valid ISO 8601 date string')
  }
  
  if (!Array.isArray(habitObj.completionDates)) {
    throw new Error('Habit must have a completionDates array')
  }
  
  for (const date of habitObj.completionDates) {
    if (typeof date !== 'string') {
      throw new Error('All completionDates must be strings')
    }
    if (!isValidISO8601(date)) {
      throw new Error('All completionDates must be valid ISO 8601 date strings')
    }
  }
  
  if (habitObj.stackingHabits !== undefined) {
    if (!Array.isArray(habitObj.stackingHabits)) {
      throw new Error('Habit stackingHabits must be an array if provided')
    }
    for (const id of habitObj.stackingHabits) {
      if (typeof id !== 'string' || id.trim() === '') {
        throw new Error('All stackingHabits elements must be non-empty strings')
      }
    }
  }

  if (habitObj.stackingCompletions !== undefined) {
    if (typeof habitObj.stackingCompletions !== 'object' || habitObj.stackingCompletions === null || Array.isArray(habitObj.stackingCompletions)) {
      throw new Error('Habit stackingCompletions must be an object if provided')
    }
    const completions = habitObj.stackingCompletions as Record<string, unknown>
    for (const key of Object.keys(completions)) {
      if (typeof key !== 'string' || key.trim() === '') {
        throw new Error('Habit stackingCompletions keys must be non-empty strings')
      }
      const arr = completions[key]
      if (!Array.isArray(arr)) {
        throw new Error('Habit stackingCompletions values must be arrays')
      }
      for (const dateStr of arr) {
        if (typeof dateStr !== 'string') {
          throw new Error('All stackingCompletions date strings must be strings')
        }
        if (!isValidISO8601(dateStr)) {
          throw new Error('All stackingCompletions date strings must be valid ISO 8601')
        }
      }
    }
  }

  if (habitObj.autoCompletedDates !== undefined) {
    if (!Array.isArray(habitObj.autoCompletedDates)) {
      throw new Error('Habit autoCompletedDates must be an array if provided')
    }
    for (const date of habitObj.autoCompletedDates) {
      if (typeof date !== 'string') {
        throw new Error('All autoCompletedDates must be strings')
      }
      if (!isValidISO8601(date)) {
        throw new Error('All autoCompletedDates must be valid ISO 8601 date strings')
      }
    }
  }

  if (habitObj.stackingStepLabels !== undefined) {
    if (typeof habitObj.stackingStepLabels !== 'object' || habitObj.stackingStepLabels === null || Array.isArray(habitObj.stackingStepLabels)) {
      throw new Error('Habit stackingStepLabels must be an object if provided')
    }
    const labels = habitObj.stackingStepLabels as Record<string, unknown>
    for (const key of Object.keys(labels)) {
      if (typeof key !== 'string' || key.trim() === '') {
        throw new Error('Habit stackingStepLabels keys must be non-empty strings')
      }
      const val = labels[key]
      if (typeof val !== 'string' || (val as string).trim() === '') {
        throw new Error('Habit stackingStepLabels values must be non-empty strings')
      }
    }
  }

  const stringFields = ['name', 'description']
  for (const field of stringFields) {
    if (habitObj[field] !== undefined && typeof habitObj[field] !== 'string') {
      throw new Error(`Habit field "${field}" must be a string if provided`)
    }
  }
  
  if (habitObj.name && typeof habitObj.name === 'string' && habitObj.name.length > MAX_NAME_LENGTH) {
    throw new Error(`Habit name must not exceed ${MAX_NAME_LENGTH} characters`)
  }
  
  if (habitObj.description && typeof habitObj.description === 'string' && habitObj.description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Habit description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`)
  }
  
  const habitSize = JSON.stringify(habit).length
  if (habitSize > MAX_HABIT_SIZE) {
    throw new Error('Habit data exceeds maximum size')
  }
}

