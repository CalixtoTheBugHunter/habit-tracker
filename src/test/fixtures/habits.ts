import type { Habit } from '../../types/habit'

/**
 * Creates a mock habit with default values that can be overridden.
 * 
 * @param overrides - Partial habit object to override default values
 * @returns A complete Habit object
 */
export function createMockHabit(overrides?: Partial<Habit>): Habit {
  return {
    id: '1',
    name: 'Exercise',
    description: 'Daily exercise routine',
    createdDate: new Date().toISOString(),
    completionDates: [],
    ...overrides,
  }
}

/**
 * Predefined mock habit factories for common test scenarios.
 */
export const mockHabits = {
  /**
   * Creates a minimal habit with only required fields.
   */
  minimal: (): Habit => ({
    id: '1',
    createdDate: new Date().toISOString(),
    completionDates: [],
  }),

  /**
   * Creates a habit with all fields populated.
   */
  full: (): Habit => createMockHabit(),

  /**
   * Creates a habit with completion dates.
   * 
   * @param dates - Array of ISO 8601 date strings
   */
  withCompletions: (dates: string[]): Habit => createMockHabit({ completionDates: dates }),
}

