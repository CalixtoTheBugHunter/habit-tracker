import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import './InstallPrompt.css'
import type { BeforeInstallPromptEvent } from '../../../types/pwa'

export function InstallPrompt() {
  const { messages } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true
    }
    return false
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isInstalled) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isInstalled])

  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
      setIsVisible(false)
    }

    setDeferredPrompt(null)
  }

  if (isInstalled || !isVisible || !deferredPrompt) {
    return null
  }

  return (
    <button
      className="install-prompt"
      onClick={handleInstallClick}
      aria-label={messages.installPrompt.ariaLabel}
      title={messages.installPrompt.title}
    >
      <Download className="install-prompt__icon" aria-hidden="true" />
      <span className="install-prompt__text">{messages.installPrompt.button}</span>
    </button>
  )
}

