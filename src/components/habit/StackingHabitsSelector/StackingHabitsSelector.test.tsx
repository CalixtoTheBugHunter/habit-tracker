import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { StackingHabitsSelector } from './StackingHabitsSelector'
import { renderWithProviders } from '../../../test/utils/render-helpers'
import { createMockHabit } from '../../../test/fixtures/habits'

function renderSelector(props: ComponentProps<typeof StackingHabitsSelector>) {
  return renderWithProviders(<StackingHabitsSelector {...props} />)
}

describe('StackingHabitsSelector', () => {
  const habitA = createMockHabit({ id: 'habit-a', name: 'Habit A' })
  const habitB = createMockHabit({ id: 'habit-b', name: 'Habit B' })
  const habitC = createMockHabit({ id: 'habit-c', name: 'Habit C' })
  const habits = [habitA, habitB, habitC]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty when value is empty', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector value={[]} onChange={onChange} habits={habits} />
    )
    expect(screen.getByLabelText(/stacked habits/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/type to search habits/i)).toBeInTheDocument()
    expect(screen.queryByText('Habit A')).not.toBeInTheDocument()
  })

  it('shows selected habits by name', () => {
    renderWithProviders(
      <StackingHabitsSelector value={['habit-a', 'habit-b']} onChange={vi.fn()} habits={habits} />
    )
    expect(screen.getByText('Habit A')).toBeInTheDocument()
    expect(screen.getByText('Habit B')).toBeInTheDocument()
  })

  it('adds habit from dropdown when option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector value={[]} onChange={onChange} habits={habits} />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    const listbox = screen.getByRole('listbox')
    const optionA = within(listbox).getByText('Habit A')
    await user.click(optionA)
    expect(onChange).toHaveBeenCalledWith(['habit-a'])
  })

  it('adds first habit when Enter is pressed with dropdown open', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector value={[]} onChange={onChange} habits={habits} />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(['habit-a'])
  })

  it('adds highlighted habit when Enter is pressed after ArrowDown', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector value={[]} onChange={onChange} habits={habits} />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    await user.keyboard('{ArrowDown}') // highlight second (Habit B)
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(['habit-b'])
  })

  it('Add button adds highlighted option', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector value={[]} onChange={onChange} habits={habits} />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    const addBtn = screen.getByRole('button', { name: /^add$/i })
    await user.click(addBtn)
    expect(onChange).toHaveBeenCalledWith(['habit-a'])
  })

  it('remove button removes habit from selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector
        value={['habit-a', 'habit-b']}
        onChange={onChange}
        habits={habits}
      />
    )
    const removeA = screen.getByRole('button', { name: /remove habit a from stack/i })
    await user.click(removeA)
    expect(onChange).toHaveBeenCalledWith(['habit-b'])
  })

  it('shows filter input and listbox options', async () => {
    const user = userEvent.setup()
    renderSelector({ value: [], onChange: vi.fn(), habits })
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    expect(screen.getByRole('listbox')).toHaveTextContent('Habit A')
    expect(screen.getByRole('listbox')).toHaveTextContent('Habit B')
    expect(screen.getByRole('listbox')).toHaveTextContent('Habit C')
    // Filtering is implemented (options filtered by filterText in component); full filter behavior covered by e2e
    await user.type(input, 'B')
    await waitFor(() => expect(input).toHaveValue('B'))
    expect(within(screen.getByRole('listbox')).getByText('Habit B')).toBeInTheDocument()
  })

  it('excludes excludeId from options', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <StackingHabitsSelector
        value={[]}
        onChange={vi.fn()}
        habits={habits}
        excludeId="habit-b"
      />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).getByText('Habit A')).toBeInTheDocument()
    expect(within(listbox).getByText('Habit C')).toBeInTheDocument()
    expect(within(listbox).queryByText('Habit B')).not.toBeInTheDocument()
  })

  it('in edit mode excludes options that would create cycle', async () => {
    const parent = createMockHabit({ id: 'parent', name: 'Parent' })
    const childWithBackRef = createMockHabit({
      id: 'habit-a',
      name: 'Habit A',
      stackingHabits: ['parent'],
    })
    const habitsWithCycle = [parent, childWithBackRef, habitB]
    const user = userEvent.setup()
    renderWithProviders(
      <StackingHabitsSelector
        value={[]}
        onChange={vi.fn()}
        habits={habitsWithCycle}
        excludeId="parent"
      />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    const listbox = screen.getByRole('listbox')
    expect(within(listbox).queryByText('Habit A')).not.toBeInTheDocument()
    expect(within(listbox).getByText('Habit B')).toBeInTheDocument()
  })

  it('disabled state disables input and remove buttons', () => {
    renderWithProviders(
      <StackingHabitsSelector
        value={['habit-a']}
        onChange={vi.fn()}
        habits={habits}
        disabled
      />
    )
    expect(screen.getByPlaceholderText(/type to search habits/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /remove habit a from stack/i })).toBeDisabled()
  })

  it('Add button is enabled when filterText is non-empty and no options match', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector value={[]} onChange={onChange} habits={[]} />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    await user.type(input, 'Drink water')
    const addBtn = screen.getByRole('button', { name: /^add$/i })
    expect(addBtn).not.toBeDisabled()
  })

  it('creates new step when no options match and user types and clicks Add', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector value={[]} onChange={onChange} habits={[]} />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    await user.type(input, 'Drink water')
    const addBtn = screen.getByRole('button', { name: /^add$/i })
    await user.click(addBtn)
    expect(onChange).toHaveBeenCalledTimes(1)
    const [ids, newStepLabels] = onChange.mock.calls[0]!
    expect(ids).toHaveLength(1)
    expect(newStepLabels).toBeDefined()
    expect(Object.keys(newStepLabels!)).toHaveLength(1)
    expect(newStepLabels![ids[0]]).toBe('Drink water')
  })

  it('creates new step when no options and user presses Enter after typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(
      <StackingHabitsSelector value={[]} onChange={onChange} habits={[]} />
    )
    const input = screen.getByPlaceholderText(/type to search habits/i)
    await user.click(input)
    await user.type(input, 'Morning routine')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledTimes(1)
    const [ids, newStepLabels] = onChange.mock.calls[0]!
    expect(ids).toHaveLength(1)
    expect(newStepLabels).toBeDefined()
    expect(newStepLabels![ids[0]]).toBe('Morning routine')
  })

  it('shows stackingStepLabels for selected stacking-only step', () => {
    renderWithProviders(
      <StackingHabitsSelector
        value={['step-uuid-1']}
        onChange={vi.fn()}
        habits={[]}
        stackingStepLabels={{ 'step-uuid-1': 'Drink water' }}
      />
    )
    expect(screen.getByText('Drink water')).toBeInTheDocument()
  })

  it('has accessible combobox and remove aria', () => {
    renderWithProviders(
      <StackingHabitsSelector value={['habit-a']} onChange={vi.fn()} habits={habits} />
    )
    expect(screen.getByRole('textbox', { name: /add habit to stack/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove habit a from stack/i })).toBeInTheDocument()
  })
})
