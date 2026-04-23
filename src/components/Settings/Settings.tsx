import { useEffect, useId, useRef, useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LocaleCode } from '../../locale/types'
import { SettingsChangelogPanel } from './SettingsChangelogPanel'
import './Settings.css'
import { AppHeader } from '../AppHeader/AppHeader'

interface SettingsProps {
  onClose: () => void
}

type SettingsPanel = 'list' | 'changelog'

export function Settings({ onClose }: SettingsProps) {
  const { messages, locale, setLanguage, supportedLanguages } = useLanguage()
  const [panel, setPanel] = useState<SettingsPanel>('list')
  const settingsRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const settingsTitleId = useId()

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
      <div
        ref={settingsRef}
        className="settings"
        aria-labelledby="settings-changelog-title"
      >
        <AppHeader onMenuToggle={() => setMenuOpen(prev => !prev)} menuOpen={menuOpen} />
          <h2
            id="settings-changelog-title"
            className="settings__title settings__title--sub"
          >
            {messages.settings.changelogTitle}
          </h2>
        <div className="settings__changelog-scroll">
          <SettingsChangelogPanel />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={settingsRef}
      className="settings"
      aria-labelledby={settingsTitleId}
    >
      <header className="settings__header">
        <h2 id={settingsTitleId} className="settings__title">
          {messages.settings.title}
        </h2>
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
