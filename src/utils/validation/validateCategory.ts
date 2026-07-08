import type { Category } from '../../types/category'
import { isValidISO8601 } from '../date/isValidISO8601'

export const MAX_CATEGORY_NAME_LENGTH = 50

/**
 * Validates that an unknown value is a valid Category object.
 *
 * @param category - The value to validate
 * @throws Error if the value is not a valid Category
 */
export function validateCategory(category: unknown): asserts category is Category {
  if (!category || typeof category !== 'object') {
    throw new Error('Category must be an object')
  }
  const categoryObj = category as Record<string, unknown>

  if (!categoryObj.id || typeof categoryObj.id !== 'string' || categoryObj.id.trim() === '') {
    throw new Error('Category must have a non-empty string id')
  }

  if (!categoryObj.name || typeof categoryObj.name !== 'string' || categoryObj.name.trim() === '') {
    throw new Error('Category must have a non-empty string name')
  }

  if (categoryObj.name.length > MAX_CATEGORY_NAME_LENGTH) {
    throw new Error(`Category name must not exceed ${MAX_CATEGORY_NAME_LENGTH} characters`)
  }

  if (
    !categoryObj.createdDate ||
    typeof categoryObj.createdDate !== 'string' ||
    categoryObj.createdDate.trim() === ''
  ) {
    throw new Error('Category must have a non-empty string createdDate')
  }

  if (!isValidISO8601(categoryObj.createdDate)) {
    throw new Error('Category createdDate must be a valid ISO 8601 date string')
  }
}
