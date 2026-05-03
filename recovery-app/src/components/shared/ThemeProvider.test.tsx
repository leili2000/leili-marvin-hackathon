import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { ThemeProvider } from './ThemeProvider'

afterEach(() => {
  cleanup()
  // Clean up any leftover CSS properties
  const style = document.documentElement.style
  style.removeProperty('--color-primary')
  style.removeProperty('--color-primary-light')
  style.removeProperty('--color-primary-dark')
  style.removeProperty('--color-primary-contrast')
})

describe('ThemeProvider', () => {
  it('injects CSS custom properties on mount', () => {
    render(
      <ThemeProvider favoriteColor="#4f8a6e">
        <div>child</div>
      </ThemeProvider>
    )

    const style = document.documentElement.style
    expect(style.getPropertyValue('--color-primary')).toBe('#4f8a6e')
    expect(style.getPropertyValue('--color-primary-light')).toBeTruthy()
    expect(style.getPropertyValue('--color-primary-dark')).toBeTruthy()
    expect(style.getPropertyValue('--color-primary-contrast')).toBeTruthy()
  })

  it('renders children', () => {
    const { getByText } = render(
      <ThemeProvider favoriteColor="#4f8a6e">
        <span>Hello</span>
      </ThemeProvider>
    )

    expect(getByText('Hello')).toBeInTheDocument()
  })

  it('updates CSS properties when favoriteColor changes', () => {
    const { rerender } = render(
      <ThemeProvider favoriteColor="#4f8a6e">
        <div />
      </ThemeProvider>
    )

    const style = document.documentElement.style
    const initialPrimary = style.getPropertyValue('--color-primary')
    expect(initialPrimary).toBe('#4f8a6e')

    rerender(
      <ThemeProvider favoriteColor="#e74c3c">
        <div />
      </ThemeProvider>
    )

    expect(style.getPropertyValue('--color-primary')).toBe('#e74c3c')
    expect(style.getPropertyValue('--color-primary')).not.toBe(initialPrimary)
  })

  it('cleans up CSS properties on unmount', () => {
    const { unmount } = render(
      <ThemeProvider favoriteColor="#4f8a6e">
        <div />
      </ThemeProvider>
    )

    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#4f8a6e')

    unmount()

    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('')
  })

  it('sets contrast to #ffffff for dark colors', () => {
    render(
      <ThemeProvider favoriteColor="#1a1a2e">
        <div />
      </ThemeProvider>
    )

    expect(document.documentElement.style.getPropertyValue('--color-primary-contrast')).toBe('#ffffff')
  })

  it('sets contrast to #000000 for light colors', () => {
    render(
      <ThemeProvider favoriteColor="#f0e68c">
        <div />
      </ThemeProvider>
    )

    expect(document.documentElement.style.getPropertyValue('--color-primary-contrast')).toBe('#000000')
  })
})
