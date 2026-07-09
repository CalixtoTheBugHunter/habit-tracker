import { describe, it, expect } from 'vitest'
import { validateCategory, MAX_CATEGORY_NAME_LENGTH } from './validateCategory'
import { createMockCategory } from '../../test/fixtures/categories'

describe('validateCategory', () => {
  it('accepts a valid category', () => {
    expect(() => validateCategory(createMockCategory())).not.toThrow()
  })

  it('throws when value is not an object', () => {
    expect(() => validateCategory(null)).toThrow('Category must be an object')
    expect(() => validateCategory('nope')).toThrow('Category must be an object')
  })

  it('throws when id is missing or empty', () => {
    expect(() => validateCategory(createMockCategory({ id: '' }))).toThrow(
      'Category must have a non-empty string id'
    )
  })

  it('throws when name is missing or empty', () => {
    expect(() => validateCategory(createMockCategory({ name: '' }))).toThrow(
      'Category must have a non-empty string name'
    )
  })

  it('throws when name exceeds the maximum length', () => {
    const longName = 'a'.repeat(MAX_CATEGORY_NAME_LENGTH + 1)
    expect(() => validateCategory(createMockCategory({ name: longName }))).toThrow(
      `Category name must not exceed ${MAX_CATEGORY_NAME_LENGTH} characters`
    )
  })

  it('throws when createdDate is missing', () => {
    expect(() => validateCategory(createMockCategory({ createdDate: '' }))).toThrow(
      'Category must have a non-empty string createdDate'
    )
  })

  it('throws when createdDate is not valid ISO 8601', () => {
    expect(() => validateCategory(createMockCategory({ createdDate: 'not-a-date' }))).toThrow(
      'Category createdDate must be a valid ISO 8601 date string'
    )
  })
})
