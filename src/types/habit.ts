/**
 * Habit data model used by frontend and IndexedDB.
 * 
 * @property id - Unique identifier for the habit (required, non-empty string)
 * @property name - Display name of the habit (optional string)
 * @property description - Detailed description of the habit (optional string)
 * @property createdDate - ISO 8601 date string when the habit was created (required)
 * @property completionDates - Array of ISO 8601 date strings representing completion dates (required, can be empty)
 * 
 * Constraints:
 * - id must be a non-empty string
 * - createdDate must be a valid ISO 8601 date string
 * - completionDates must be an array of ISO 8601 date strings
 * - name and description are optional but must be strings if provided
 */
export interface Habit {
  id: string
  name?: string
  description?: string
  createdDate: string
  completionDates: string[]
}

