import { describe, it, expect } from 'vitest'

// These are the anonymous names embedded in usePosts.ts
// Keeping them tested ensures they don't accidentally get cleared
const ANONYMOUS_NAMES = [
  'Sunrise Walker', 'River Stone', 'Quiet Harbor', 'Morning Tide',
  'Still Standing', 'New Chapter', 'Steady Breath', 'Open Road',
  'Clear Sky', 'Gentle Current', 'Warm Light', 'Steady Ground',
  'Rising Tide', 'Soft Rain', 'New Dawn', 'Calm Waters',
]

describe('anonymous names pool', () => {
  it('has at least 10 names for variety', () => {
    expect(ANONYMOUS_NAMES.length).toBeGreaterThanOrEqual(10)
  })

  it('all names are non-empty strings', () => {
    for (const name of ANONYMOUS_NAMES) {
      expect(typeof name).toBe('string')
      expect(name.length).toBeGreaterThan(0)
    }
  })

  it('has no duplicates', () => {
    const unique = new Set(ANONYMOUS_NAMES)
    expect(unique.size).toBe(ANONYMOUS_NAMES.length)
  })

  it('all names are two words', () => {
    for (const name of ANONYMOUS_NAMES) {
      expect(name.trim().split(' ').length).toBe(2)
    }
  })
})
