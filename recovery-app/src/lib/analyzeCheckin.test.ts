import { describe, it, expect } from 'vitest'
import {
  buildWordFlags,
  detectWordRisk,
  STOP_WORDS,
} from './analyzeCheckin'
import type { CheckIn, RelapseWordFlag } from '../types/index'

// ─── Helpers ──────────────────────────────────────────────────────────────────

let idCounter = 0

function makeCheckIn(
  date: string,
  status: 'clean' | 'relapse',
  note: string | null = null,
  relapseReason: string | null = null
): CheckIn {
  return {
    id: `ci-${++idCounter}`,
    userId: 'user-1',
    date,
    status,
    note,
    relapseReason,
  }
}

function makeWordFlag(word: string, frequency: number): RelapseWordFlag {
  return {
    id: `wf-${++idCounter}`,
    userId: 'user-1',
    word,
    frequency,
    lastSeen: null,
  }
}

// ─── buildWordFlags ───────────────────────────────────────────────────────────

describe('buildWordFlags', () => {
  it('excludes stop words from output', () => {
    // Create check-ins where stop words appear in pre-relapse context
    // We need the word to appear ≥2 times to pass the occurrence filter
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'that this with have from they will been'),
      makeCheckIn('2024-01-02', 'clean', 'that this with have from they will been'),
      makeCheckIn('2024-01-08', 'relapse'), // relapse within LOOKBACK_DAYS of both
    ]

    const result = buildWordFlags(checkIns)

    for (const stopWord of STOP_WORDS) {
      expect(result.has(stopWord)).toBe(false)
    }
  })

  it('excludes words below MIN_WORD_LENGTH', () => {
    // Short words like "bad", "sad", "low" (3 chars) should be excluded
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
    // "lonely" appears in only 1 check-in
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'feeling lonely today'),
      makeCheckIn('2024-01-08', 'relapse'),
    ]

    const result = buildWordFlags(checkIns)

    expect(result.has('lonely')).toBe(false)
  })

  it('filters words below the risk threshold', () => {
    // "stressed" appears in 1 pre-relapse and 3 clean contexts
    // total = 4, riskScore = 1 / (4 + 1) = 0.2 < 0.6
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'feeling stressed today'),
      makeCheckIn('2024-01-08', 'relapse'), // makes Jan 1 pre-relapse context
      makeCheckIn('2024-02-01', 'clean', 'feeling stressed again'),
      makeCheckIn('2024-03-01', 'clean', 'stressed about work'),
      makeCheckIn('2024-04-01', 'clean', 'stressed about exams'),
    ]

    const result = buildWordFlags(checkIns)

    // "stressed" has riskScore = 1/(4+1) = 0.2, below threshold
    expect(result.has('stressed')).toBe(false)
  })

  it('includes words that meet all criteria', () => {
    // "craving" appears in 2 pre-relapse contexts and 0 clean contexts
    // riskScore = 2 / (2 + 0 + 1) = 0.667 >= 0.6
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', 'having craving thoughts'),
      makeCheckIn('2024-01-05', 'relapse'), // makes Jan 1 pre-relapse
      makeCheckIn('2024-02-01', 'clean', 'craving is strong today'),
      makeCheckIn('2024-02-05', 'relapse'), // makes Feb 1 pre-relapse
    ]

    const result = buildWordFlags(checkIns)

    expect(result.has('craving')).toBe(true)
    const stats = result.get('craving')!
    expect(stats.relapseContextCount).toBe(2)
    expect(stats.cleanContextCount).toBe(0)
  })

  it('counts each word only once per check-in', () => {
    // "craving" appears multiple times in the same note but should count once
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
    // "loneliness" appears via relapseReason on Jan 1 and note on Feb 1,
    // both within LOOKBACK_DAYS before a relapse
    const checkIns = [
      makeCheckIn('2024-01-01', 'clean', null, 'loneliness is hard'),
      makeCheckIn('2024-01-05', 'relapse'), // makes Jan 1 pre-relapse
      makeCheckIn('2024-02-01', 'clean', 'loneliness again today', null),
      makeCheckIn('2024-02-05', 'relapse'), // makes Feb 1 pre-relapse
    ]

    const result = buildWordFlags(checkIns)

    // "loneliness" has 2 relapse context counts, 0 clean
    // riskScore = 2 / (2 + 0 + 1) = 0.667 >= 0.6
    expect(result.has('loneliness')).toBe(true)
    const stats = result.get('loneliness')!
    expect(stats.relapseContextCount).toBe(2)
    expect(stats.cleanContextCount).toBe(0)
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

// ─── detectWordRisk ───────────────────────────────────────────────────────────

describe('detectWordRisk', () => {
  it('finds matching words in recent notes', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'feeling craving and anxious today'),
      makeCheckIn('2024-03-02', 'clean', 'still craving badly'),
      makeCheckIn('2024-03-03', 'clean', 'better today no craving'),
    ]

    const wordFlags = [
      makeWordFlag('craving', 5),
      makeWordFlag('anxious', 3),
    ]

    const result = detectWordRisk(recentCheckIns, wordFlags)

    expect(result.length).toBe(2)

    const cravingSignal = result.find(s => s.word === 'craving')!
    expect(cravingSignal).toBeDefined()
    expect(cravingSignal.recentOccurrences).toBe(3)
    expect(cravingSignal.historicalFrequency).toBe(5)
    expect(cravingSignal.riskScore).toBe(0.5) // min(5/10, 1.0)

    const anxiousSignal = result.find(s => s.word === 'anxious')!
    expect(anxiousSignal).toBeDefined()
    expect(anxiousSignal.recentOccurrences).toBe(1)
    expect(anxiousSignal.riskScore).toBe(0.3) // min(3/10, 1.0)
  })

  it('returns empty array when no word flags match recent notes', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'had a great day today'),
      makeCheckIn('2024-03-02', 'clean', 'feeling wonderful'),
    ]

    const wordFlags = [
      makeWordFlag('craving', 5),
      makeWordFlag('anxious', 3),
    ]

    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result).toEqual([])
  })

  it('returns empty array when word flags list is empty', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'feeling craving today'),
    ]

    const result = detectWordRisk(recentCheckIns, [])
    expect(result).toEqual([])
  })

  it('returns empty array when check-ins have no notes', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean'),
      makeCheckIn('2024-03-02', 'clean'),
    ]

    const wordFlags = [makeWordFlag('craving', 5)]

    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result).toEqual([])
  })

  it('sorts results by riskScore descending', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'craving anxious lonely stressed'),
    ]

    const wordFlags = [
      makeWordFlag('craving', 3),   // riskScore = 0.3
      makeWordFlag('anxious', 8),   // riskScore = 0.8
      makeWordFlag('lonely', 10),   // riskScore = 1.0 (capped)
      makeWordFlag('stressed', 5),  // riskScore = 0.5
    ]

    const result = detectWordRisk(recentCheckIns, wordFlags)

    expect(result.length).toBe(4)
    expect(result[0].word).toBe('lonely')
    expect(result[1].word).toBe('anxious')
    expect(result[2].word).toBe('stressed')
    expect(result[3].word).toBe('craving')
  })

  it('uses word boundary matching to avoid partial matches', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'the cravings are overwhelming'),
    ]

    // "craving" should NOT match "cravings" due to word boundary
    const wordFlags = [makeWordFlag('craving', 5)]

    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result).toEqual([])
  })

  it('caps riskScore at 1.0 for high-frequency words', () => {
    const recentCheckIns = [
      makeCheckIn('2024-03-01', 'clean', 'feeling lonely today'),
    ]

    const wordFlags = [makeWordFlag('lonely', 15)] // 15/10 = 1.5, capped to 1.0

    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result.length).toBe(1)
    expect(result[0].riskScore).toBe(1.0)
  })

  it('only scans the last SCAN_DAYS check-ins', () => {
    const recentCheckIns = [
      makeCheckIn('2024-02-25', 'clean', 'craving is strong'),  // older, beyond SCAN_DAYS slice
      makeCheckIn('2024-02-26', 'clean', 'craving is strong'),
      makeCheckIn('2024-02-27', 'clean', 'craving is strong'),
      makeCheckIn('2024-03-01', 'clean', 'feeling great today'),
      makeCheckIn('2024-03-02', 'clean', 'all good here'),
      makeCheckIn('2024-03-03', 'clean', 'wonderful day'),
    ]

    const wordFlags = [makeWordFlag('craving', 5)]

    // slice(-3) takes the last 3 check-ins which don't contain "craving"
    const result = detectWordRisk(recentCheckIns, wordFlags)
    expect(result).toEqual([])
  })
})
