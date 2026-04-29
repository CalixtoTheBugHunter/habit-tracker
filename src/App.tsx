import { useState } from 'react'
import './App.css'
import { formatMessage } from './locale'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { HabitProvider, useHabits } from './contexts/HabitContext'
import {
  HabitList,
  HabitForm,
  OfflineIndicator,
  ServiceWorkerUpdatePrompt,
  ErrorBoundary,
  AppHeader,
  SideMenu,
  Settings,
  StatisticsView,
} from './components'
import type { AppView } from './components'
import type { Habit } from './types/habit'

function AppContent() {
  const { messages } = useLanguage()
  const { isLoading, error } = useHabits()
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState<AppView>('home')

  const handleNavigate = (view: AppView) => {
    setActiveView(view)
    setEditingHabit(undefined)
  }

  const goHome = () => {
    handleNavigate('home')
    setMenuOpen(false)
  }

  if (isLoading) {
    return (
      <div className="app">
        <OfflineIndicator />
        <ServiceWorkerUpdatePrompt />
        <AppHeader
          onMenuToggle={() => setMenuOpen(prev => !prev)}
          menuOpen={menuOpen}
          onHomeClick={goHome}
          homeIsActive={activeView === 'home'}
        />
        <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} activeView={activeView} onNavigate={handleNavigate} />
        <div className="app-loading" role="status" aria-live="polite" aria-atomic="true">
          <p>{messages.app.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <OfflineIndicator />
        <ServiceWorkerUpdatePrompt />
        <AppHeader
          onMenuToggle={() => setMenuOpen(prev => !prev)}
          menuOpen={menuOpen}
          onHomeClick={goHome}
          homeIsActive={activeView === 'home'}
        />
        <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} activeView={activeView} onNavigate={handleNavigate} />
        <div className="app-error" role="alert" aria-live="assertive" aria-atomic="true">
          <p className="error">{formatMessage(messages.app.error, { error })}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <OfflineIndicator />
      <ServiceWorkerUpdatePrompt />
      <AppHeader
        onMenuToggle={() => setMenuOpen(prev => !prev)}
        menuOpen={menuOpen}
        onHomeClick={goHome}
        homeIsActive={activeView === 'home'}
      />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} activeView={activeView} onNavigate={handleNavigate} />
      <main className="app-main">
        {activeView === 'home' && (
          <>
            <HabitForm
              habit={editingHabit}
              onSuccess={() => setEditingHabit(undefined)}
              onCancel={() => setEditingHabit(undefined)}
            />
            <section className="habit-list-container">
              <HabitList onEdit={setEditingHabit} />
            </section>
          </>
        )}
        {activeView === 'settings' && (
          <Settings onClose={() => setActiveView('home')} />
        )}
        {activeView === 'statistics' && (
          <StatisticsView />
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ErrorBoundary>
          <HabitProvider>
            <AppContent />
          </HabitProvider>
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
