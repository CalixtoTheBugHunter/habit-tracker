import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { ConfirmationModal } from './ConfirmationModal'

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this item?',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<ConfirmationModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it.each([
    { prop: 'title', text: 'Confirm Delete' },
    { prop: 'message', text: 'Are you sure you want to delete this item?' },
  ])('should display $prop', ({ text }) => {
    render(<ConfirmationModal {...defaultProps} />)
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('should display confirm and cancel buttons', () => {
    render(<ConfirmationModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />)

    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />)

    const backdrop = screen.getByRole('dialog').parentElement
    if (backdrop) {
      await user.click(backdrop)
      expect(onCancel).toHaveBeenCalledTimes(1)
    }
  })

  it('should not call onCancel when modal content is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />)

    const modalContent = screen.getByRole('dialog')
    await user.click(modalContent)

    expect(onCancel).not.toHaveBeenCalled()
  })

  it('should call onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} />)

    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should not call onCancel when Escape is pressed if isConfirming is true', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} isConfirming={true} />)

    await user.keyboard('{Escape}')

    expect(onCancel).not.toHaveBeenCalled()
  })

  it('should not call onCancel when backdrop is clicked if isConfirming is true', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmationModal {...defaultProps} onCancel={onCancel} isConfirming={true} />)

    const backdrop = screen.getByRole('dialog').parentElement
    if (backdrop) {
      await user.click(backdrop)
      expect(onCancel).not.toHaveBeenCalled()
    }
  })

  it('should have proper ARIA attributes', () => {
    render(<ConfirmationModal {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
  })

  it('should use custom confirm and cancel labels', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmLabel="Yes, delete it"
        cancelLabel="No, keep it"
      />
    )
    expect(screen.getByRole('button', { name: 'Yes, delete it' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No, keep it' })).toBeInTheDocument()
  })

  it('should use default labels when not provided', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Test"
        message="Test message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should disable buttons when isConfirming is true', () => {
    render(<ConfirmationModal {...defaultProps} isConfirming={true} />)
    const confirmButton = screen.getByRole('button', { name: /processing/i })
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })

    expect(confirmButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('should show default loading state on confirm button when isConfirming is true', () => {
    render(<ConfirmationModal {...defaultProps} isConfirming={true} />)
    const confirmButton = screen.getByRole('button', { name: /processing/i })
    expect(confirmButton).toBeInTheDocument()
  })

  it('should show custom confirmingLabel when isConfirming is true', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        isConfirming={true}
        confirmingLabel="Deleting..."
      />
    )
    const confirmButton = screen.getByRole('button', { name: 'Deleting...' })
    expect(confirmButton).toBeInTheDocument()
  })

  it('should use alert button variant by default', () => {
    render(<ConfirmationModal {...defaultProps} />)
    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    expect(confirmButton).toHaveClass('confirmation-modal-button-alert')
  })

  it('should apply primary button variant when specified', () => {
    render(<ConfirmationModal {...defaultProps} buttonVariant="primary" />)
    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    expect(confirmButton).toHaveClass('confirmation-modal-button-primary')
  })

  it('should apply warning button variant when specified', () => {
    render(<ConfirmationModal {...defaultProps} buttonVariant="warning" />)
    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    expect(confirmButton).toHaveClass('confirmation-modal-button-warning')
  })

  it('should apply success button variant when specified', () => {
    render(<ConfirmationModal {...defaultProps} buttonVariant="success" />)
    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    expect(confirmButton).toHaveClass('confirmation-modal-button-success')
  })
})
