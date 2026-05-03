import { describe, it, expect } from 'vitest'
import { hexToHsl, hslToHex, deriveTheme, isValidHex } from './theme'

// ─── isValidHex ───────────────────────────────────────────────────────────────

describe('isValidHex', () => {
  it('accepts valid 6-digit hex colors', () => {
    expect(isValidHex('#000000')).toBe(true)
    expect(isValidHex('#ffffff')).toBe(true)
    expect(isValidHex('#4f8a6e')).toBe(true)
    expect(isValidHex('#ABCDEF')).toBe(true)
    expect(isValidHex('#a1B2c3')).toBe(true)
  })

  it('rejects invalid formats', () => {
    expect(isValidHex('')).toBe(false)
    expect(isValidHex('#fff')).toBe(false)        // 3-digit shorthand
    expect(isValidHex('000000')).toBe(false)       // missing #
    expect(isValidHex('#0000000')).toBe(false)     // 7 digits
    expect(isValidHex('#gggggg')).toBe(false)      // invalid chars
    expect(isValidHex('#12345')).toBe(false)       // 5 digits
    expect(isValidHex('#12345g')).toBe(false)      // invalid char at end
  })
})

// ─── hexToHsl ─────────────────────────────────────────────────────────────────

describe('hexToHsl', () => {
  it('converts black', () => {
    expect(hexToHsl('#000000')).toEqual([0, 0, 0])
  })

  it('converts white', () => {
    expect(hexToHsl('#ffffff')).toEqual([0, 0, 100])
  })

  it('converts pure red', () => {
    expect(hexToHsl('#ff0000')).toEqual([0, 100, 50])
  })

  it('converts pure green', () => {
    expect(hexToHsl('#00ff00')).toEqual([120, 100, 50])
  })

  it('converts pure blue', () => {
    expect(hexToHsl('#0000ff')).toEqual([240, 100, 50])
  })

  it('converts a mid-tone color', () => {
    const [h, s, l] = hexToHsl('#4f8a6e')
    // Approximate values for this teal-green
    expect(h).toBeGreaterThanOrEqual(140)
    expect(h).toBeLessThanOrEqual(160)
    expect(s).toBeGreaterThan(0)
    expect(l).toBeGreaterThan(0)
    expect(l).toBeLessThan(100)
  })

  it('converts grey (achromatic)', () => {
    const [h, s, l] = hexToHsl('#808080')
    expect(h).toBe(0)
    expect(s).toBe(0)
    expect(l).toBe(50)
  })
})

// ─── hslToHex ─────────────────────────────────────────────────────────────────

describe('hslToHex', () => {
  it('converts black', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000')
  })

  it('converts white', () => {
    expect(hslToHex(0, 0, 100)).toBe('#ffffff')
  })

  it('converts pure red', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000')
  })

  it('converts pure green', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00ff00')
  })

  it('converts pure blue', () => {
    expect(hslToHex(240, 100, 50)).toBe('#0000ff')
  })
})

// ─── hexToHsl / hslToHex roundtrip ───────────────────────────────────────────

describe('hexToHsl / hslToHex roundtrip', () => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#000000', '#ffffff', '#808080']

  colors.forEach((hex) => {
    it(`roundtrips ${hex}`, () => {
      const [h, s, l] = hexToHsl(hex)
      expect(hslToHex(h, s, l)).toBe(hex)
    })
  })
})

// ─── deriveTheme ──────────────────────────────────────────────────────────────

describe('deriveTheme', () => {
  it('returns all four CSS custom property keys', () => {
    const theme = deriveTheme('#4f8a6e')
    expect(theme).toHaveProperty('--color-primary')
    expect(theme).toHaveProperty('--color-primary-light')
    expect(theme).toHaveProperty('--color-primary-dark')
    expect(theme).toHaveProperty('--color-primary-contrast')
  })

  it('sets --color-primary to the input hex', () => {
    const theme = deriveTheme('#4f8a6e')
    expect(theme['--color-primary']).toBe('#4f8a6e')
  })

  it('lightens the color for --color-primary-light', () => {
    const [, , originalL] = hexToHsl('#4f8a6e')
    const theme = deriveTheme('#4f8a6e')
    const [, , lightL] = hexToHsl(theme['--color-primary-light'])
    expect(lightL).toBeGreaterThan(originalL)
  })

  it('darkens the color for --color-primary-dark', () => {
    const [, , originalL] = hexToHsl('#4f8a6e')
    const theme = deriveTheme('#4f8a6e')
    const [, , darkL] = hexToHsl(theme['--color-primary-dark'])
    expect(darkL).toBeLessThan(originalL)
  })

  it('clamps light to max 95', () => {
    // A very light color (lightness ~90)
    const theme = deriveTheme('#e6e6e6')
    const [, , lightL] = hexToHsl(theme['--color-primary-light'])
    expect(lightL).toBeLessThanOrEqual(95)
  })

  it('clamps dark to min 10', () => {
    // A very dark color (lightness ~10)
    const theme = deriveTheme('#1a1a1a')
    const [, , darkL] = hexToHsl(theme['--color-primary-dark'])
    expect(darkL).toBeGreaterThanOrEqual(10)
  })

  it('sets contrast to #000000 for light colors (lightness > 50)', () => {
    // White has lightness 100
    const theme = deriveTheme('#ffffff')
    expect(theme['--color-primary-contrast']).toBe('#000000')
  })

  it('sets contrast to #ffffff for dark colors (lightness <= 50)', () => {
    // Black has lightness 0
    const theme = deriveTheme('#000000')
    expect(theme['--color-primary-contrast']).toBe('#ffffff')
  })

  it('sets contrast to #ffffff when lightness is exactly 50', () => {
    // Pure red has lightness exactly 50
    const theme = deriveTheme('#ff0000')
    expect(theme['--color-primary-contrast']).toBe('#ffffff')
  })

  it('all derived values are valid hex colors', () => {
    const theme = deriveTheme('#4f8a6e')
    Object.values(theme).forEach((value) => {
      expect(isValidHex(value)).toBe(true)
    })
  })
})
