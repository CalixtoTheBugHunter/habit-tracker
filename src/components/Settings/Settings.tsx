import { useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { messages } from '../../locale'
import './Settings.css'

interface SettingsProps {
  onClose: () => void
  onNavigateToChangelog?: () => void
}

export function Settings({ onClose, onNavigateToChangelog }: SettingsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="settings">
      <header className="settings__header">
        <h1 className="settings__title">{messages.settings.title}</h1>
        <button
          className="settings__close-button"
          onClick={onClose}
          aria-label={messages.settings.close}
        >
          <X size={24} aria-hidden="true" />
        </button>
      </header>
      <nav className="settings__nav">
        <ul className="settings__list">
          <li>
            <button
              className="settings__item"
              onClick={() => onNavigateToChangelog?.()}
            >
              <span className="settings__item-label">
                {messages.settings.items.changelog}
              </span>
              <ChevronRight
                className="settings__item-icon"
                size={20}
                aria-hidden="true"
              />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
