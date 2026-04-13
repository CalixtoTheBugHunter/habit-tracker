import { useEffect, useId, useRef, useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LocaleCode } from '../../locale/types'
import { SettingsChangelogPanel } from './SettingsChangelogPanel'
import './Settings.css'

interface SettingsProps {
  onClose: () => void
}

type SettingsPanel = 'list' | 'changelog'

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (el) => !el.hasAttribute('disabled')
  )
}

export function Settings({ onClose }: SettingsProps) {
  const { messages, locale, setLanguage, supportedLanguages } = useLanguage()
  const [panel, setPanel] = useState<SettingsPanel>('list')
  const settingsRef = useRef<HTMLDivElement>(null)
  const settingsTitleId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

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

  useEffect(() => {
    const root = settingsRef.current
    if (!root) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusableElements(root)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', handleTab)
    return () => root.removeEventListener('keydown', handleTab)
  }, [panel])

  useEffect(() => {
    const root = settingsRef.current
    if (!root) return
    const focusable = getFocusableElements(root)
    focusable[0]?.focus()
  }, [panel])

  if (panel === 'changelog') {
    return (
      <div
        ref={settingsRef}
        className="settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-changelog-title"
      >
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
    <div
      ref={settingsRef}
      className="settings"
      role="dialog"
      aria-modal="true"
      aria-labelledby={settingsTitleId}
    >
      <header className="settings__header">
        <h1 id={settingsTitleId} className="settings__title">
          {messages.settings.title}
        </h1>
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
