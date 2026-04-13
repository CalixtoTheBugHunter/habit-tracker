import { useEffect, useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LocaleCode } from '../../locale/types'
import { SettingsChangelogPanel } from './SettingsChangelogPanel'
import './Settings.css'

interface SettingsProps {
  onClose: () => void
}

type SettingsPanel = 'list' | 'changelog'

export function Settings({ onClose }: SettingsProps) {
  const { messages, locale, setLanguage, supportedLanguages } = useLanguage()
  const [panel, setPanel] = useState<SettingsPanel>('list')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (panel === 'changelog') {
          setPanel('list')
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, panel])

  if (panel === 'changelog') {
    return (
      <div className="settings">
        <header className="settings__header settings__header--sub">
          <button
            type="button"
            className="settings__back-button"
            onClick={() => setPanel('list')}
            aria-label={messages.settings.changelogBack}
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <h1
            id="settings-changelog-title"
            className="settings__title settings__title--sub"
          >
            {messages.settings.changelogTitle}
          </h1>
          <button
            className="settings__close-button"
            onClick={onClose}
            aria-label={messages.settings.close}
          >
            <X size={24} aria-hidden="true" />
          </button>
        </header>
        <div className="settings__changelog-scroll">
          <SettingsChangelogPanel />
        </div>
      </div>
    )
  }

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
              type="button"
              className="settings__item"
              onClick={() => setPanel('changelog')}
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
