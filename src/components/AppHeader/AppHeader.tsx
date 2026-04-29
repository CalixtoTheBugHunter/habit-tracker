import type { MouseEvent } from 'react'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { InstallPrompt } from '../pwa/InstallPrompt/InstallPrompt'
import './AppHeader.css'

interface AppHeaderProps {
  onMenuToggle: () => void
  menuOpen: boolean
  onHomeClick: () => void
  homeIsActive: boolean
}

export function AppHeader({ onMenuToggle, menuOpen, onHomeClick, homeIsActive }: AppHeaderProps) {
  const { messages } = useLanguage()
  const homeHref = import.meta.env.BASE_URL

  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onHomeClick()
  }

  return (
    <header className="app-header">
      <button
        type="button"
        className="app-header__menu-button"
        onClick={onMenuToggle}
        aria-label={menuOpen ? messages.appHeader.menuButtonCloseAria : messages.appHeader.menuButtonOpenAria}
        aria-expanded={menuOpen}
        aria-controls="side-menu"
      >
        {menuOpen ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <Menu size={24} aria-hidden="true" />
        )}
      </button>
      <h1 className="app-header__logo">
        <a
          className="app-header__logo-link"
          href={homeHref}
          onClick={handleLogoClick}
          aria-current={homeIsActive ? 'page' : undefined}
        >
          <span className="app-header__logo-mark" aria-hidden="true" />
          <span className="app-header__logo-text">{messages.app.title}</span>
        </a>
      </h1>
      <div className="app-header__actions">
        <InstallPrompt />
      </div>
    </header>
  )
}
