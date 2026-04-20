import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import './ServiceWorkerUpdatePrompt.css'

export function ServiceWorkerUpdatePrompt() {
  const { messages } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const handleUpdateReady = (event: Event) => {
      const customEvent = event as CustomEvent<{ registration: ServiceWorkerRegistration }>
      registrationRef.current = customEvent.detail?.registration ?? null
      setIsVisible(true)
    }

    window.addEventListener('sw-update-ready', handleUpdateReady)

    return () => {
      window.removeEventListener('sw-update-ready', handleUpdateReady)
    }
  }, [])

  const handleReload = () => {
    const waiting = registrationRef.current?.waiting
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    window.location.reload()
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="sw-update-prompt"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={messages.serviceWorkerUpdate.ariaLabel}
    >
      <RefreshCw className="sw-update-prompt__icon" aria-hidden="true" />
      <span className="sw-update-prompt__message">
        {messages.serviceWorkerUpdate.message}
      </span>
      <div className="sw-update-prompt__actions">
        <button
          className="sw-update-prompt__reload"
          onClick={handleReload}
        >
          {messages.serviceWorkerUpdate.reloadButton}
        </button>
        <button
          className="sw-update-prompt__dismiss"
          onClick={handleDismiss}
          aria-label={messages.serviceWorkerUpdate.dismissAriaLabel}
        >
          {messages.serviceWorkerUpdate.dismissButton}
        </button>
      </div>
    </div>
  )
}
