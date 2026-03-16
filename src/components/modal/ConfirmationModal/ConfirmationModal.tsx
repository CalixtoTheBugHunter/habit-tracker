import { useId } from 'react'
import { messages } from '../../../locale'
import { Modal } from '../Modal/Modal'
import '../Modal/Modal.css'
import './ConfirmationModal.css'

type ButtonVariant = 'primary' | 'alert' | 'warning' | 'success'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmingLabel?: string
  buttonVariant?: ButtonVariant
  onConfirm: () => void
  onCancel: () => void
  isConfirming?: boolean
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = messages.confirmationModal.defaultConfirm,
  cancelLabel = messages.confirmationModal.defaultCancel,
  confirmingLabel,
  buttonVariant = 'alert',
  onConfirm,
  onCancel,
  isConfirming = false,
}: ConfirmationModalProps) {
  const messageId = useId()
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      ariaDescribedBy={messageId}
      closeOnBackdropClick={!isConfirming}
      closeOnEscape={!isConfirming}
    >
      <p id={messageId} className="confirmation-modal-message">
        {message}
      </p>
      <div className="confirmation-modal-actions">
        <button
          type="button"
          className="confirmation-modal-button confirmation-modal-button-secondary"
          onClick={onCancel}
          disabled={isConfirming}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`confirmation-modal-button confirmation-modal-button-${buttonVariant}`}
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? (confirmingLabel ?? messages.confirmationModal.defaultProcessing) : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
