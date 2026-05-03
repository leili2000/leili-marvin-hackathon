import { useEffect, type ReactNode } from 'react'
import { deriveTheme } from '../../lib/theme'

interface ThemeProviderProps {
  favoriteColor: string
  children: ReactNode
}

export function ThemeProvider({ favoriteColor, children }: ThemeProviderProps) {
  useEffect(() => {
    const theme = deriveTheme(favoriteColor)
    const style = document.documentElement.style

    for (const [property, value] of Object.entries(theme)) {
      style.setProperty(property, value)
    }

    return () => {
      for (const property of Object.keys(theme)) {
        style.removeProperty(property)
      }
    }
  }, [favoriteColor])

  return <>{children}</>
}
