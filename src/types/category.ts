/**
 * Category (tag) data model used to organize habits.
 *
 * @property id - Unique identifier for the category (required, non-empty string)
 * @property name - Display name of the category (required, non-empty string)
 * @property createdDate - ISO 8601 date string when the category was created (required)
 *
 * Constraints:
 * - id must be a non-empty string
 * - name must be a non-empty string no longer than the configured maximum length
 * - createdDate must be a valid ISO 8601 date string
 */
export interface Category {
  id: string
  name: string
  createdDate: string
}
