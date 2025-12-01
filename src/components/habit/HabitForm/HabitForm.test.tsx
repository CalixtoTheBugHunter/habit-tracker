import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HabitForm } from './HabitForm'
import { renderWithProviders } from '../../../test/utils/render-helpers'
import { createMockHabit } from '../../../test/fixtures/habits'
import { addHabit, updateHabit, openDB, getAllHabits } from '../../../services/indexedDB'

vi.mock('../../../services/indexedDB', () => ({
  openDB: vi.fn(),
  getAllHabits: vi.fn(),
  addHabit: vi.fn(),
  updateHabit: vi.fn(),
  testUtils: {
    resetDB: vi.fn(),
  },
}))

describe('HabitForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openDB).mockResolvedValue({} as IDBDatabase)
    vi.mocked(getAllHabits).mockResolvedValue([])
  })

  describe('Create mode', () => {
    it('should render form with empty fields', () => {
      renderWithProviders(<HabitForm />)

      expect(screen.getByLabelText(/name/i)).toHaveValue('')
      expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
      expect(screen.getByText(/create new habit/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create habit/i })).toBeInTheDocument()
    })

    it('should show validation error when submitting with empty name', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HabitForm />)

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
      expect(vi.mocked(addHabit)).not.toHaveBeenCalled()
    })

    it('should show validation error when submitting with whitespace-only name', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, '   ')
      
      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
      expect(vi.mocked(addHabit)).not.toHaveBeenCalled()
    })

    it('should clear validation error when user starts typing', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HabitForm />)

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await screen.findByText(/name is required/i)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'Exercise')

      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
      })
    })

    it('should create habit with name only', async () => {
      const user = userEvent.setup()
      vi.mocked(addHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'Exercise')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(addHabit)).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Exercise',
            description: undefined,
          })
        )
      })
    })

    it('should create habit with name and description', async () => {
      const user = userEvent.setup()
      vi.mocked(addHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.click(nameInput)
      await user.type(nameInput, 'Exercise')

      const descriptionInput = await screen.findByLabelText(/description/i)
      await user.type(descriptionInput, 'Daily workout routine')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(addHabit)).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Exercise',
            description: 'Daily workout routine',
          })
        )
      })
    })

    it('should trim whitespace from name and description', async () => {
      const user = userEvent.setup()
      vi.mocked(addHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.click(nameInput)
      await user.type(nameInput, '  Exercise  ')

      const descriptionInput = await screen.findByLabelText(/description/i)
      await user.type(descriptionInput, '  Daily workout  ')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(addHabit)).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Exercise',
            description: 'Daily workout',
          })
        )
      })
    })

    it('should show success message after creating habit', async () => {
      const user = userEvent.setup()
      vi.mocked(addHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'Exercise')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/habit created successfully/i)).toBeInTheDocument()
    })

    it('should clear form after successful creation', async () => {
      const user = userEvent.setup()
      vi.mocked(addHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.click(nameInput)
      await user.type(nameInput, 'Exercise')

      const descriptionInput = await screen.findByLabelText(/description/i)
      await user.type(descriptionInput, 'Daily workout')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(nameInput).toHaveValue('')
        expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
      })
    })

    it('should show error message when creation fails', async () => {
      const user = userEvent.setup()
      vi.mocked(addHabit).mockRejectedValue(new Error('Database error'))

      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'Exercise')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/failed to save habit. please try again./i)).toBeInTheDocument()
    })

    it('should call refreshHabits after successful creation', async () => {
      const user = userEvent.setup()
      vi.mocked(addHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'Exercise')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(getAllHabits)).toHaveBeenCalled()
      })
    })

    it('should disable form fields and button while submitting', async () => {
      const user = userEvent.setup()
      let resolveAddHabit: (value: string) => void
      const addHabitPromise = new Promise<string>((resolve) => {
        resolveAddHabit = resolve
      })
      vi.mocked(addHabit).mockReturnValue(addHabitPromise)

      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'Exercise')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
        expect(submitButton).toHaveTextContent(/saving/i)
        expect(nameInput).toBeDisabled()
      })

      resolveAddHabit!('1')
      await addHabitPromise

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
        expect(nameInput).not.toBeDisabled()
      })
    })

    it('should call onSuccess callback after successful creation', async () => {
      const user = userEvent.setup()
      const onSuccess = vi.fn()
      vi.mocked(addHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm onSuccess={onSuccess} />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'Exercise')

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('Edit mode', () => {
    it('should render form with pre-filled habit data', () => {
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
        description: 'Daily workout',
      })

      renderWithProviders(<HabitForm habit={habit} />)

      expect(screen.getByLabelText(/name/i)).toHaveValue('Exercise')
      expect(screen.getByLabelText(/description/i)).toHaveValue('Daily workout')
      expect(screen.getByText(/edit habit/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update habit/i })).toBeInTheDocument()
    })

    it('should pre-fill form with habit that has no description', () => {
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
        description: undefined,
      })

      renderWithProviders(<HabitForm habit={habit} />)

      expect(screen.getByLabelText(/name/i)).toHaveValue('Exercise')
      expect(screen.getByLabelText(/description/i)).toHaveValue('')
    })

    it('should update habit when form is submitted', async () => {
      const user = userEvent.setup()
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
        description: 'Old description',
      })
      vi.mocked(updateHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm habit={habit} />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Exercise')

      const descriptionInput = screen.getByLabelText(/description/i)
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'New description')

      const submitButton = screen.getByRole('button', { name: /update habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(updateHabit)).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            name: 'Updated Exercise',
            description: 'New description',
            createdDate: habit.createdDate,
            completionDates: habit.completionDates,
          })
        )
      })
    })

    it('should preserve habit id, createdDate, and completionDates when updating', async () => {
      const user = userEvent.setup()
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
        createdDate: '2025-01-01T00:00:00.000Z',
        completionDates: ['2025-01-01T00:00:00.000Z'],
      })
      vi.mocked(updateHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm habit={habit} />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Exercise')

      const submitButton = screen.getByRole('button', { name: /update habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(updateHabit)).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            createdDate: '2025-01-01T00:00:00.000Z',
            completionDates: ['2025-01-01T00:00:00.000Z'],
          })
        )
      })
    })

    it('should show success message after updating habit', async () => {
      const user = userEvent.setup()
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
      })
      vi.mocked(updateHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm habit={habit} />)

      const submitButton = screen.getByRole('button', { name: /update habit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/habit updated successfully/i)).toBeInTheDocument()
    })

    it('should not clear form after successful update when habit prop remains', async () => {
      const user = userEvent.setup()
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
        description: 'Daily workout',
      })
      vi.mocked(updateHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm habit={habit} />)

      const nameInput = screen.getByLabelText(/name/i)
      const descriptionInput = screen.getByLabelText(/description/i)

      const submitButton = screen.getByRole('button', { name: /update habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(nameInput).toHaveValue('Exercise')
        expect(descriptionInput).toHaveValue('Daily workout')
      })
    })

    it('should show error message when update fails', async () => {
      const user = userEvent.setup()
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
      })
      vi.mocked(updateHabit).mockRejectedValue(new Error('Update failed'))

      renderWithProviders(<HabitForm habit={habit} />)

      const submitButton = screen.getByRole('button', { name: /update habit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/failed to save habit. please try again./i)).toBeInTheDocument()
    })

    it('should call refreshHabits after successful update', async () => {
      const user = userEvent.setup()
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
      })
      vi.mocked(updateHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm habit={habit} />)

      const submitButton = screen.getByRole('button', { name: /update habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(vi.mocked(getAllHabits)).toHaveBeenCalled()
      })
    })

    it('should call onSuccess callback after successful update', async () => {
      const user = userEvent.setup()
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
      })
      const onSuccess = vi.fn()
      vi.mocked(updateHabit).mockResolvedValue('1')

      renderWithProviders(<HabitForm habit={habit} onSuccess={onSuccess} />)

      const submitButton = screen.getByRole('button', { name: /update habit/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('Cancel functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      renderWithProviders(<HabitForm onCancel={onCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })

    it('should reset form to initial values when cancel is clicked in create mode', async () => {
      const user = userEvent.setup()

      renderWithProviders(<HabitForm onCancel={() => {}} />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.click(nameInput)
      await user.type(nameInput, 'Exercise')

      const descriptionInput = await screen.findByLabelText(/description/i)
      await user.type(descriptionInput, 'Daily workout')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(nameInput).toHaveValue('')
      expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
    })

    it('should reset form to habit values when cancel is clicked in edit mode', async () => {
      const user = userEvent.setup()
      const habit = createMockHabit({
        id: '1',
        name: 'Exercise',
        description: 'Daily workout',
      })

      renderWithProviders(<HabitForm habit={habit} onCancel={() => {}} />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Changed Name')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(nameInput).toHaveValue('Exercise')
    })

    it('should clear validation errors when cancel is clicked', async () => {
      const user = userEvent.setup()

      renderWithProviders(<HabitForm onCancel={() => {}} />)

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      await screen.findByText(/name is required/i)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
      })
    })

    it('should not show cancel button when onCancel is not provided', () => {
      renderWithProviders(<HabitForm />)

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<HabitForm />)

      expect(screen.getByRole('form', { name: /create habit form/i })).toBeInTheDocument()
    })

    it('should mark name field as required', () => {
      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      expect(nameInput).toHaveAttribute('aria-required', 'true')
    })

    it('should mark name field as invalid when there is an error', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HabitForm />)

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      const nameInput = await screen.findByLabelText(/name/i)
      expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    })

    it('should associate error message with name field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HabitForm />)

      const submitButton = screen.getByRole('button', { name: /create habit/i })
      await user.click(submitButton)

      const nameInput = await screen.findByLabelText(/name/i)
      const errorMessage = await screen.findByText(/name is required/i)
      
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error')
      expect(errorMessage).toHaveAttribute('id', 'name-error')
    })

    it('should allow focusing the name input field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.click(nameInput)

      expect(nameInput).toHaveFocus()
    })

    it('should allow focusing the description textarea field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.click(nameInput)

      const descriptionInput = await screen.findByLabelText(/description/i)
      await user.click(descriptionInput)

      expect(descriptionInput).toHaveFocus()
    })

    it('should allow tabbing between form fields', async () => {
      const user = userEvent.setup()
      renderWithProviders(<HabitForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.click(nameInput)
      expect(nameInput).toHaveFocus()

      await user.tab()
      const descriptionInput = await screen.findByLabelText(/description/i)
      expect(descriptionInput).toHaveFocus()
    })
  })
})

