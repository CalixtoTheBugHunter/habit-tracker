import { useEffect, useRef } from 'react'
import { Home, BarChart3, Settings } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import './SideMenu.css'

export type AppView = 'home' | 'settings' | 'statistics'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  activeView: AppView
  onNavigate: (view: AppView) => void
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function SideMenu({ isOpen, onClose, activeView, onNavigate }: SideMenuProps) {
  const { messages } = useLanguage()
  const menuRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const root = menuRef.current
    if (!root) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        el => !el.hasAttribute('disabled')
      )
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
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const root = menuRef.current
    if (!root) return
    const focusable = [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
      el => !el.hasAttribute('disabled')
    )
    focusable[0]?.focus()
  }, [isOpen])

  const handleNavigate = (view: AppView) => {
    onNavigate(view)
    onClose()
  }

  const navItems: { view: AppView; label: string; icon: typeof Home }[] = [
    { view: 'home', label: messages.sideMenu.home, icon: Home },
    { view: 'statistics', label: messages.sideMenu.statistics, icon: BarChart3 },
    { view: 'settings', label: messages.sideMenu.settings, icon: Settings },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="side-menu__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        ref={menuRef}
        className={`side-menu ${isOpen ? 'side-menu--open' : ''}`}
        role="navigation"
        aria-label={messages.sideMenu.navigationAria}
        aria-hidden={!isOpen}
        {...(!isOpen ? { inert: '' as const } : {})}
      >
        <ul className="side-menu__list">
          {navItems.map(({ view, label, icon: Icon }) => (
            <li key={view}>
              <button
                type="button"
                className={`side-menu__item ${activeView === view ? 'side-menu__item--active' : ''}`}
                onClick={() => handleNavigate(view)}
                aria-current={activeView === view ? 'page' : undefined}
              >
                <Icon size={20} aria-hidden="true" className="side-menu__item-icon" />
                <span className="side-menu__item-label">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
