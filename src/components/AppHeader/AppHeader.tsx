import { Menu, X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { InstallPrompt } from '../pwa/InstallPrompt/InstallPrompt'
import './AppHeader.css'

interface AppHeaderProps {
  onMenuToggle: () => void
  menuOpen: boolean
}

export function AppHeader({ onMenuToggle, menuOpen }: AppHeaderProps) {
  const { messages } = useLanguage()

  return (
    <header className="app-header">
      <button
        type="button"
        className="app-header__menu-button"
        onClick={onMenuToggle}
        aria-label={menuOpen ? messages.appHeader.menuButtonCloseAria : messages.appHeader.menuButtonOpenAria}
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <Menu size={24} aria-hidden="true" />
        )}
      </button>
      <div className="app-header__logo" ><img src="logo.png" width="214px" /></div>
      <div className="app-header__actions">
        <InstallPrompt />
      </div>
    </header>
  )
}
