import React from 'react'

export interface ThemeColor {
  id: string
  label: string
  primary: string
  primaryLight: string
  primaryDark: string
}

export const THEME_COLORS: ThemeColor[] = [
  { id: 'forest',   label: 'Forest',   primary: '#3d6b4f', primaryLight: '#e8f0eb', primaryDark: '#2e5239' },
  { id: 'ocean',    label: 'Ocean',    primary: '#2563a8', primaryLight: '#dbeafe', primaryDark: '#1d4ed8' },
  { id: 'sunset',   label: 'Sunset',   primary: '#c2410c', primaryLight: '#ffedd5', primaryDark: '#9a3412' },
  { id: 'lavender', label: 'Lavender', primary: '#7c3aed', primaryLight: '#ede9fe', primaryDark: '#6d28d9' },
  { id: 'rose',     label: 'Rose',     primary: '#be185d', primaryLight: '#fce7f3', primaryDark: '#9d174d' },
  { id: 'slate',    label: 'Slate',    primary: '#334155', primaryLight: '#f1f5f9', primaryDark: '#1e293b' },
  { id: 'teal',     label: 'Teal',     primary: '#0f766e', primaryLight: '#ccfbf1', primaryDark: '#0d5e57' },
  { id: 'amber',    label: 'Amber',    primary: '#b45309', primaryLight: '#fef3c7', primaryDark: '#92400e' },
]

interface ColorPickerProps {
  selected: string
  onChange: (colorId: string) => void
  label?: string
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selected,
  onChange,
  label = 'Choose your theme color',
}) => {
  return (
    <div className="color-picker">
      <p className="color-picker__label">{label}</p>
      <div className="color-picker__grid">
        {THEME_COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            className={`color-swatch ${selected === color.id ? 'color-swatch--selected' : ''}`}
            style={{ '--swatch-color': color.primary } as React.CSSProperties}
            onClick={() => onChange(color.id)}
            aria-label={color.label}
            title={color.label}
          >
            {selected === color.id && (
              <span className="color-swatch__check">✓</span>
            )}
          </button>
        ))}
      </div>
      <p className="color-picker__selected-label">
        {THEME_COLORS.find((c) => c.id === selected)?.label ?? ''}
      </p>
    </div>
  )
}

/** Apply a theme color to the document root CSS variables */
export function applyThemeColor(colorId: string) {
  const color = THEME_COLORS.find((c) => c.id === colorId) ?? THEME_COLORS[0]
  const root = document.documentElement
  root.style.setProperty('--color-primary', color.primary)
  root.style.setProperty('--color-primary-light', color.primaryLight)
  root.style.setProperty('--color-primary-dark', color.primaryDark)
}
