import { describe, it, expect } from 'vitest'
import { formatMessage } from './formatMessage'

describe('formatMessage', () => {
  it('should replace single placeholder', () => {
    expect(formatMessage('Hello {name}', { name: 'World' })).toBe('Hello World')
  })

  it('should replace multiple placeholders', () => {
    expect(
      formatMessage('{greeting} {name}', { greeting: 'Hi', name: 'User' })
    ).toBe('Hi User')
  })

  it('should use empty string for missing key', () => {
    expect(formatMessage('Hello {name}', {})).toBe('Hello ')
  })

  it('should handle number values', () => {
    expect(formatMessage('{streak}-day streak', { streak: 5 })).toBe(
      '5-day streak'
    )
  })
})
