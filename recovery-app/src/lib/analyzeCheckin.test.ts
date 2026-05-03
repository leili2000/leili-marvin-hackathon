import { describe, it, expect } from 'vitest'
import {
  buildWordFlags,
  detectWordRisk,
  STOP_WORDS,
} from './analyzeCheckin'
import type { CheckIn, RelapseWordFlag } from '../types/index'

let idCounter = 0

function makeCheckIn(
  date: string,
  status: 'clean' | 'relapse',
  note: string | null = null,
  relapseReason: string | null = null
): CheckIn {
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
    for (const stopWord of STOP_WORDS) {
      expect(result.has(stopWord)).toBe(false)
    }
  })

  it('excludes words below MIN_WORD_LENGTH (4 chars)', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'bad sad low cry'),
      makeCheckIn('2024-01-02', 'clean', 'bad sad low cry'),
      makeCheckIn('2024-01-08', 'relapse'),
    ]
    const result = buildWordFlags(checkIns)
    expect(result.has('bad')).toBe(false)
    expect(result.has('sad')).toBe(false)
    expect(result.has('low')).toBe(false)
    expect(result.has('cry')).toBe(false)
  })

  it('excludes words with fewer than 2 total occurrences', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'feeling lonely today'),
      makeCheckIn('2024-01-08', 'relapse'),
    ]
    const result = buildWordFlags(checkIns)
    expect(result.has('lonely')).toBe(false)
  })

  it('filters words below the risk threshold (0.6)', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'feeling stressed today'),
      makeCheckIn('2024-01-08', 'relapse'),
      makeCheckIn('2024-02-01', 'clean', 'feeling stressed again'),
      makeCheckIn('2024-03-01', 'clean', 'stressed about work'),
      makeCheckIn('2024-04-01', 'clean', 'stressed about exams'),
    ]
    const result = buildWordFlags(checkIns)
    expect(result.has('stressed')).toBe(false)
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
    const stats = result.get('craving')!
    expect(stats.relapseContextCount).toBe(2)
    expect(stats.cleanContextCount).toBe(0)
  })

  it('counts each word only once per check-in', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'craving craving craving craving'),
      makeCheckIn('2024-01-05', 'relapse'),
      makeCheckIn('2024-02-01', 'clean', 'craving craving again'),
      makeCheckIn('2024-02-05', 'relapse'),
    ]
    const result = buildWordFlags(checkIns)
    expect(result.has('craving')).toBe(true)
    const stats = result.get('craving')!
    expect(stats.relapseContextCount).toBe(2)
    expect(stats.cleanContextCount).toBe(0)
  })

  it('combines note and relapseReason text', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', null, 'loneliness is hard'),
      makeCheckIn('2024-01-05', 'relapse'),
      makeCheckIn('2024-02-01', 'clean', 'loneliness again today', null),
      makeCheckIn('2024-02-05', 'relapse'),
    ]
    const result = buildWordFlags(checkIns)
    expect(result.has('loneliness')).toBe(true)
  })

  it('returns empty map when no check-ins have notes', () => {
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean'),
      makeCheckIn('2024-01-05', 'relapse'),
    ]
    const result = buildWordFlags(checkIns)
    expect(result.size).toBe(0)
  })
})

describe('detectWordRisk', () => {
  it('finds matching words in recent notes', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'feeling craving and anxious today'),
      makeCheckIn('2024-03-02', 'clean', 'still craving badly'),
      makeCheckIn('2024-03-03', 'clean', 'better today no craving'),
    ]
    const wordFlags = [makeWordFlag('craving', 5), makeWordFlag('anxious', 3)]
    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result.length).toBe(2)
    const cravingSignal = result.find(s => s.word === 'craving')!
    expect(cravingSignal.recentOccurrences).toBe(3)
    expect(cravingSignal.riskScore).toBe(0.5)
  })

  it('returns empty array when no word flags match recent notes', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'had a great day today'),
    ]
    const wordFlags = [makeWordFlag('craving', 5)]
    expect(detectWordRisk(recentCheckIns, wordFlags)).toEqual([])
  })

  it('returns empty array when word flags list is empty', () => {
    const recentCheckIns = [makeCheckIn('2024-03-01', 'clean', 'feeling craving today')]
    expect(detectWordRisk(recentCheckIns, [])).toEqual([])
  })

  it('sorts results by riskScore descending', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'craving anxious lonely stressed'),
    ]
    const wordFlags = [
      makeWordFlag('craving', 3),
      makeWordFlag('anxious', 8),
      makeWordFlag('lonely', 10),
      makeWordFlag('stressed', 5),
    ]
    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result[0].word).toBe('lonely')
    expect(result[1].word).toBe('anxious')
    expect(result[2].word).toBe('stressed')
    expect(result[3].word).toBe('craving')
  })

  it('caps riskScore at 1.0', () => {
    const recentCheckIns = [makeCheckIn('2024-03-01', 'clean', 'feeling lonely today')]
    const wordFlags = [makeWordFlag('lonely', 15)]
    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result[0].riskScore).toBe(1.0)
  })
})
