import { describe, it, expect } from 'vitest'
import { buildWordFlags, detectWordRisk, STOP_WORDS } from './analyzeCheckin'
import type { CheckIn, RelapseWordFlag } from '../types/index'

let idCounter = 0
function makeCheckIn(date: string, status: 'clean' | 'relapse', note: string | null = null, relapseReason: string | null = null): CheckIn {
  return { id: `ci-${++idCounter}`, userId: 'user-1', date, status, note, relapseReason }
}
function makeWordFlag(word: string, frequency: number): RelapseWordFlag {
  return { id: `wf-${++idCounter}`, userId: 'user-1', word, frequency, lastSeen: null }
}

describe('buildWordFlags', () => {
  it('excludes stop words from output', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'that this with have from they will been'),
      makeCheckIn('2024-01-02', 'clean', 'that this with have from they will been'),
      makeCheckIn('2024-01-08', 'relapse'),
    ]
    const result = buildWordFlags(checkIns)
    for (const stopWord of STOP_WORDS) expect(result.has(stopWord)).toBe(false)
  })

  it('excludes words below 4 chars', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'bad sad low cry'),
      makeCheckIn('2024-01-02', 'clean', 'bad sad low cry'),
      makeCheckIn('2024-01-08', 'relapse'),
    ]
    const result = buildWordFlags(checkIns)
    expect(result.has('bad')).toBe(false)
    expect(result.has('sad')).toBe(false)
  })

  it('excludes words with fewer than 2 occurrences', () => {
    const checkIns = [makeCheckIn('2024-01-01', 'clean', 'feeling lonely today'), makeCheckIn('2024-01-08', 'relapse')]
    expect(buildWordFlags(checkIns).has('lonely')).toBe(false)
  })

  it('includes words that meet all criteria', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'having craving thoughts'),
      makeCheckIn('2024-01-05', 'relapse'),
      makeCheckIn('2024-02-01', 'clean', 'craving is strong today'),
      makeCheckIn('2024-02-05', 'relapse'),
    ]
    const result = buildWordFlags(checkIns)
    expect(result.has('craving')).toBe(true)
    expect(result.get('craving')!.relapseContextCount).toBe(2)
  })

  it('returns empty map when no notes', () => {
    const checkIns = [makeCheckIn('2024-01-01', 'clean'), makeCheckIn('2024-01-05', 'relapse')]
    expect(buildWordFlags(checkIns).size).toBe(0)
  })
})

describe('detectWordRisk', () => {
  it('finds matching words in recent notes', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'feeling craving and anxious today'),
      makeCheckIn('2024-03-02', 'clean', 'still craving badly'),
    ]
    const wordFlags = [makeWordFlag('craving', 5), makeWordFlag('anxious', 3)]
    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result.length).toBe(2)
    expect(result.find(s => s.word === 'craving')!.riskScore).toBe(0.5)
  })

  it('returns empty array when no matches', () => {
    const recentCheckIns = [makeCheckIn('2024-03-01', 'clean', 'had a great day')]
    expect(detectWordRisk(recentCheckIns, [makeWordFlag('craving', 5)])).toEqual([])
  })

  it('sorts results by riskScore descending', () => {
    const recentCheckIns = [makeCheckIn('2024-03-01', 'clean', 'craving anxious lonely stressed')]
    const wordFlags = [makeWordFlag('craving', 3), makeWordFlag('anxious', 8), makeWordFlag('lonely', 10), makeWordFlag('stressed', 5)]
    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result[0].word).toBe('lonely')
    expect(result[1].word).toBe('anxious')
  })

  it('caps riskScore at 1.0', () => {
    const recentCheckIns = [makeCheckIn('2024-03-01', 'clean', 'feeling lonely today')]
    expect(detectWordRisk(recentCheckIns, [makeWordFlag('lonely', 15)])[0].riskScore).toBe(1.0)
  })
})
