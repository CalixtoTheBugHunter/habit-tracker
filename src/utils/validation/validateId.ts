/**
 * Validates that an unknown value is a non-empty string (for habit IDs).
 * 
 * @param id - The value to validate
 * @throws Error if the value is not a non-empty string
 */
export function validateId(id: unknown): asserts id is string {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Habit id must be a non-empty string')
  }
}

