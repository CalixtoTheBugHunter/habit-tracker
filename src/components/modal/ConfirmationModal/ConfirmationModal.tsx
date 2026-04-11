import { useId } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
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
  confirmLabel,
  cancelLabel,
  confirmingLabel,
  buttonVariant = 'alert',
  onConfirm,
  onCancel,
  isConfirming = false,
}: ConfirmationModalProps) {
  const { messages } = useLanguage()
  const messageId = useId()
  const resolvedConfirmLabel =
    confirmLabel ?? messages.confirmationModal.defaultConfirm
  const resolvedCancelLabel =
    cancelLabel ?? messages.confirmationModal.defaultCancel
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
          {resolvedCancelLabel}
        </button>
        <button
          type="button"
          className={`confirmation-modal-button confirmation-modal-button-${buttonVariant}`}
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming
            ? confirmingLabel ?? messages.confirmationModal.defaultProcessing
            : resolvedConfirmLabel}
        </button>
      </div>
    </Modal>
  )
}
