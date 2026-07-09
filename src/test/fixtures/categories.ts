import type { Category } from '../../types/category'

/**
 * Creates a mock category with default values that can be overridden.
 *
 * @param overrides - Partial category object to override default values
 * @returns A complete Category object
 */
export function createMockCategory(overrides?: Partial<Category>): Category {
  return {
    id: 'c1',
    name: 'Health',
    createdDate: new Date().toISOString(),
    ...overrides,
  }
}
