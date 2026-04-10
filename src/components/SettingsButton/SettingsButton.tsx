import { Settings } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import './SettingsButton.css'

interface SettingsButtonProps {
  onClick: () => void
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  const { messages } = useLanguage()
  return (
    <button
      className="settings-button"
      onClick={onClick}
      aria-label={messages.settingsButton.ariaLabel}
    >
      <Settings className="settings-button__icon" size={24} aria-hidden="true" />
    </button>
  )
}
