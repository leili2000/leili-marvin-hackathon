/**
 * Theme derivation utilities.
 *
 * Converts a user's favorite hex color into a set of CSS custom properties
 * for consistent theming across the app.
 */

/**
 * Validates that a string is a valid 6-digit hex color (e.g. '#4f8a6e').
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

/**
 * Converts a hex color string to HSL values.
 *
 * @param hex - A 6-digit hex color string (e.g. '#4f8a6e')
 * @returns A tuple [h, s, l] where h is 0–360, s is 0–100, l is 0–100
 */
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    // Achromatic
    return [0, 0, Math.round(l * 100)]
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    default:
      h = ((r - g) / d + 4) / 6
      break
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

/**
 * Converts HSL values back to a hex color string.
 *
 * @param h - Hue (0–360)
 * @param s - Saturation (0–100)
 * @param l - Lightness (0–100)
 * @returns A 6-digit hex color string (e.g. '#4f8a6e')
 */
export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r: number, g: number, b: number

  if (h < 60) {
    ;[r, g, b] = [c, x, 0]
  } else if (h < 120) {
    ;[r, g, b] = [x, c, 0]
  } else if (h < 180) {
    ;[r, g, b] = [0, c, x]
  } else if (h < 240) {
    ;[r, g, b] = [0, x, c]
  } else if (h < 300) {
    ;[r, g, b] = [x, 0, c]
  } else {
    ;[r, g, b] = [c, 0, x]
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Derives a full set of CSS custom properties from a hex color.
 * Automatically generates a dark or light mode based on the color's lightness.
 *
 * Dark mode (lightness <= 35): dark backgrounds, light text
 * Light mode (lightness > 35): light backgrounds, dark text
 */
export function deriveTheme(hex: string): Record<string, string> {
  const [h, s, l] = hexToHsl(hex)

  const isDark = l <= 35

  const lightL = Math.min(l + 20, 95)
  const darkL = Math.max(l - 15, 10)

  if (isDark) {
    // Dark mode
    return {
      '--color-primary': hex,
      '--color-primary-light': hslToHex(h, Math.min(s + 10, 100), Math.min(l + 25, 60)),
      '--color-primary-dark': hslToHex(h, s, Math.max(l - 10, 5)),
      '--color-primary-contrast': '#ffffff',
      '--color-bg': hslToHex(h, Math.max(s - 20, 5), Math.max(l - 5, 8)),
      '--color-surface': hslToHex(h, Math.max(s - 15, 5), Math.min(l + 5, 25)),
      '--color-surface-hover': hslToHex(h, Math.max(s - 10, 5), Math.min(l + 10, 30)),
      '--color-text': '#e8e8e8',
      '--color-text-secondary': '#a0a0a0',
      '--color-border': hslToHex(h, Math.max(s - 15, 5), Math.min(l + 15, 35)),
      '--color-input-bg': hslToHex(h, Math.max(s - 15, 5), Math.min(l + 8, 22)),
      '--color-mode': 'dark',
    }
  }

  // Light mode
  return {
    '--color-primary': hex,
    '--color-primary-light': hslToHex(h, s, lightL),
    '--color-primary-dark': hslToHex(h, s, darkL),
    '--color-primary-contrast': l > 50 ? '#000000' : '#ffffff',
    '--color-bg': '#f7f6f3',
    '--color-surface': '#ffffff',
    '--color-surface-hover': '#f0f0f0',
    '--color-text': '#1a1a1a',
    '--color-text-secondary': '#666666',
    '--color-border': '#e2e0db',
    '--color-input-bg': '#ffffff',
    '--color-mode': 'light',
  }
}
