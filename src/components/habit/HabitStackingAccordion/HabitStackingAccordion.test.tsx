import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HabitStackingAccordion } from './HabitStackingAccordion'
import * as localeModule from '../../../locale'
import { supportedLanguages } from '../../../config/supportedLanguages'

vi.mock('../../../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useLanguage: () => ({
    locale: 'en' as const,
    messages: localeModule.getMessagesForLocale('en'),
    setLanguage: vi.fn(),
    supportedLanguages,
    isReady: true,
  }),
}))
import { createMockHabit } from '../../../test/fixtures/habits'
import { createDateString } from '../../../test/utils/date-helpers'

describe('HabitStackingAccordion', () => {
  it('renders trigger with expand aria when collapsed', () => {
    const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={[createMockHabit({ id: 'h1', name: 'Read' })]}
        onToggleStackingHabit={onToggle}
      />
    )
    const trigger = screen.getByRole('button', { name: /expand stacked habits/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands panel and shows list when trigger is clicked', async () => {
    const user = userEvent.setup()
    const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
    const resolved = [createMockHabit({ id: 'h1', name: 'Read' })]
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={resolved}
        onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
      />
    )
    const trigger = screen.getByRole('button', { name: /expand stacked habits/i })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Stacked habits')).toBeInTheDocument()
    expect(screen.getByLabelText(/mark read as done for today/i)).toBeInTheDocument()
  })

  it('collapses panel when trigger is clicked again', async () => {
    const user = userEvent.setup()
    const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={[createMockHabit({ id: 'h1', name: 'Read' })]}
        onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
      />
    )
    const trigger = screen.getByRole('button', { name: /expand stacked habits/i })
    await user.click(trigger)
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows one checkbox and label with habit name when stackingHabitsResolved has one habit', async () => {
    const user = userEvent.setup()
    const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={[createMockHabit({ id: 'h1', name: 'Read' })]}
        onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
      />
    )
    await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
    const checkbox = screen.getByRole('checkbox', { name: /mark read as done for today/i })
    expect(checkbox).toBeInTheDocument()
    expect(screen.getByText('Read')).toBeInTheDocument()
  })

  it('checkbox is checked when habit completed today (standalone)', async () => {
    const user = userEvent.setup()
    const today = createDateString(0)
    const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
    const resolved = [createMockHabit({ id: 'h1', name: 'Read', completionDates: [today] })]
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={resolved}
        onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
      />
    )
    await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
    const checkbox = screen.getByRole('checkbox', { name: /mark read as done for today/i })
    expect(checkbox).toBeChecked()
  })

  it('checkbox for stacking-only completed today is checked when parent has stackingCompletions', async () => {
    const user = userEvent.setup()
    const today = createDateString(0)
    const parent = createMockHabit({
      id: 'p1',
      stackingHabits: ['stack-only-1'],
      stackingCompletions: { 'stack-only-1': [today] },
    })
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={[undefined]}
        onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
      />
    )
    await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
    const checkbox = screen.getByRole('checkbox', { name: /mark unknown habit as done for today/i })
    expect(checkbox).toBeChecked()
  })

  it('calls onToggleStackingHabit with parent and stacking id when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)
    const parent = createMockHabit({ id: 'parent-1', stackingHabits: ['h1'] })
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={[createMockHabit({ id: 'h1', name: 'Read' })]}
        onToggleStackingHabit={onToggle}
      />
    )
    await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
    await user.click(screen.getByRole('checkbox', { name: /mark read as done for today/i }))
    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith('parent-1', 'h1')
    })
  })

  it('shows Unknown habit and enabled checkbox when resolved habit is undefined', async () => {
    const user = userEvent.setup()
    const parent = createMockHabit({ id: 'p1', stackingHabits: ['missing-id'] })
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={[undefined]}
        onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
      />
    )
    await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
    expect(screen.getByText('Unknown habit')).toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox', { name: /mark unknown habit as done for today/i })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeDisabled()
  })

  it('panel has role region and aria-labelledby', async () => {
    const user = userEvent.setup()
    const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
    render(
      <HabitStackingAccordion
        parentHabit={parent}
        stackingHabitsResolved={[createMockHabit({ id: 'h1', name: 'Read' })]}
        onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
      />
    )
    await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
    const panel = document.getElementById('habit-stacking-panel-p1')
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute('aria-labelledby', 'habit-stacking-trigger-p1')
  })

  describe('remove from stack', () => {
    it('shows remove button per row when updateHabit is provided', async () => {
      const user = userEvent.setup()
      const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
      render(
        <HabitStackingAccordion
          parentHabit={parent}
          stackingHabitsResolved={[createMockHabit({ id: 'h1', name: 'Read' })]}
          onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
          updateHabit={vi.fn().mockResolvedValue(undefined)}
        />
      )
      await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
      expect(screen.getByRole('button', { name: /remove read from stack/i })).toBeInTheDocument()
    })

    it('opens modal with correct message when remove is clicked', async () => {
      const user = userEvent.setup()
      const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
      render(
        <HabitStackingAccordion
          parentHabit={parent}
          stackingHabitsResolved={[createMockHabit({ id: 'h1', name: 'Read' })]}
          onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
          updateHabit={vi.fn().mockResolvedValue(undefined)}
        />
      )
      await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
      await user.click(screen.getByRole('button', { name: /remove read from stack/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/remove from stack/i)).toBeInTheDocument()
      expect(screen.getByText(/remove "read" from stacked habits/i)).toBeInTheDocument()
    })

    it('calls updateHabit with habit without that id and without key in stackingCompletions on confirm', async () => {
      const user = userEvent.setup()
      const updateHabitMock = vi.fn().mockResolvedValue(undefined)
      const parent = createMockHabit({
        id: 'p1',
        stackingHabits: ['h1', 'h2'],
        stackingCompletions: { h1: ['2025-01-15'], h2: ['2025-01-16'] },
      })
      render(
        <HabitStackingAccordion
          parentHabit={parent}
          stackingHabitsResolved={[
            createMockHabit({ id: 'h1', name: 'Read' }),
            createMockHabit({ id: 'h2', name: 'Write' }),
          ]}
          onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
          updateHabit={updateHabitMock}
        />
      )
      await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
      await user.click(screen.getByRole('button', { name: /remove read from stack/i }))
      const confirmButton = screen.getByRole('button', { name: /^remove$/i })
      await user.click(confirmButton)
      await waitFor(() => {
        expect(updateHabitMock).toHaveBeenCalledTimes(1)
        expect(updateHabitMock).toHaveBeenCalledWith(
          expect.objectContaining({
            stackingHabits: ['h2'],
            stackingCompletions: { h2: ['2025-01-16'] },
          })
        )
      })
    })

    it('closes modal without calling updateHabit on cancel', async () => {
      const user = userEvent.setup()
      const updateHabitMock = vi.fn().mockResolvedValue(undefined)
      const parent = createMockHabit({ id: 'p1', stackingHabits: ['h1'] })
      render(
        <HabitStackingAccordion
          parentHabit={parent}
          stackingHabitsResolved={[createMockHabit({ id: 'h1', name: 'Read' })]}
          onToggleStackingHabit={vi.fn().mockResolvedValue(undefined)}
          updateHabit={updateHabitMock}
        />
      )
      await user.click(screen.getByRole('button', { name: /expand stacked habits/i }))
      await user.click(screen.getByRole('button', { name: /remove read from stack/i }))
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
      expect(updateHabitMock).not.toHaveBeenCalled()
    })
  })
})
