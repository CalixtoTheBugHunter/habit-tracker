import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the habit tracker title', () => {
    render(<App />)
    const title = screen.getByText('Habit Tracker')
    expect(title).toBeInTheDocument()
  })

  it('renders the app description', () => {
    render(<App />)
    const description = screen.getByText(/A simple, free and offline habit tracker/)
    expect(description).toBeInTheDocument()
  })
})

