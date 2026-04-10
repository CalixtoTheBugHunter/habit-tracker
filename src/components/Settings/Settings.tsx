import { useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LocaleCode } from '../../locale/types'
import './Settings.css'

interface SettingsProps {
  onClose: () => void
  onNavigateToChangelog?: () => void
}

export function Settings({ onClose, onNavigateToChangelog }: SettingsProps) {
  const { messages, locale, setLanguage, supportedLanguages } = useLanguage()

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
          <li className="settings__language-row">
            <label
              className="settings__language-label"
              htmlFor="preferred-language"
            >
              {messages.settings.preferredLanguage}
            </label>
            <select
              id="preferred-language"
              className="settings__language-select"
              aria-label={messages.settings.languageSelectAria}
              value={locale}
              onChange={(e) => {
                void setLanguage(e.target.value as LocaleCode)
              }}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </li>
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
