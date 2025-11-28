import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <Modal {...defaultProps}>
        <div>Custom Content</div>
      </Modal>
    )
    expect(screen.getByText('Custom Content')).toBeInTheDocument()
  })

  it('should have proper ARIA attributes', () => {
    render(<Modal {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('should have aria-labelledby when title is provided', () => {
    render(<Modal {...defaultProps} title="Test Title" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby')
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should use custom titleId when provided', () => {
    render(<Modal {...defaultProps} title="Test Title" titleId="custom-title-id" />)
    const dialog = screen.getByRole('dialog')
    const titleId = dialog.getAttribute('aria-labelledby')
    expect(titleId).toBe('custom-title-id')
    expect(screen.getByText('Test Title')).toHaveAttribute('id', 'custom-title-id')
  })

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const backdrop = screen.getByRole('dialog').parentElement
    if (backdrop) {
      await user.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('should not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const modalContent = screen.getByRole('dialog')
    await user.click(modalContent)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when Escape is pressed if closeOnEscape is false', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />)

    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should not call onClose when backdrop is clicked if closeOnBackdropClick is false', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />)

    const backdrop = screen.getByRole('dialog').parentElement
    if (backdrop) {
      await user.click(backdrop)
      expect(onClose).not.toHaveBeenCalled()
    }
  })

  it('should lock body scroll when modal is open', () => {
    document.body.style.overflow = 'auto'

    const { unmount } = render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('should restore body scroll when modal is closed', () => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'auto'

    const { rerender } = render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Modal {...defaultProps} isOpen={false} />)
    expect(document.body.style.overflow).toBe(originalOverflow)
  })

  it('should trap focus within modal', async () => {
    const user = userEvent.setup()
    render(
      <Modal {...defaultProps}>
        <button>First Button</button>
        <button>Second Button</button>
        <button>Third Button</button>
      </Modal>
    )

    const firstButton = screen.getByRole('button', { name: 'First Button' })
    const thirdButton = screen.getByRole('button', { name: 'Third Button' })

    firstButton.focus()
    expect(document.activeElement).toBe(firstButton)

    await user.tab()
    expect(document.activeElement).not.toBe(firstButton)

    thirdButton.focus()
    await user.tab()
    expect(document.activeElement).toBe(firstButton)
  })

  it('should focus first focusable element when modal opens', () => {
    render(
      <Modal {...defaultProps}>
        <button>First Button</button>
        <button>Second Button</button>
      </Modal>
    )

    const firstButton = screen.getByRole('button', { name: 'First Button' })
    expect(document.activeElement).toBe(firstButton)
  })
})

