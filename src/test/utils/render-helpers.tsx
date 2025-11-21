import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { HabitProvider } from '../../contexts/HabitContext'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Future: Add more providers here as needed
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <HabitProvider>{children}</HabitProvider>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

