/**
 * Habit data model used by frontend and IndexedDB.
 * 
 * @property id - Unique identifier for the habit (required, non-empty string)
 * @property name - Display name of the habit (optional string)
 * @property description - Detailed description of the habit (optional string)
 * @property createdDate - ISO 8601 date string when the habit was created (required)
 * @property completionDates - Array of ISO 8601 date strings representing completion dates (required, can be empty)
 * @property stackingHabits - Optional array of habit IDs (references to other habits or stacking-step identifiers)
 * @property stackingCompletions - Optional map of stacking habit ID to array of ISO 8601 completion date strings; used for stacking-only steps not in the main habits list
 * @property stackingStepLabels - Optional map of stacking-step ID to display name; used when that ID is not in the main habits list (stacking-only steps)
 * @property autoCompletedDates - Optional array of ISO 8601 date strings for days the main habit was marked complete only because all stacked steps were done that day (not manual main completion)
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
  stackingHabits?: string[]
  stackingCompletions?: Record<string, string[]>
  stackingStepLabels?: Record<string, string>
  autoCompletedDates?: string[]
  goalDays?: number[]
}

