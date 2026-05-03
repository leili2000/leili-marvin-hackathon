import type { CheckIn, RelapseWordFlag, WordRiskSignal } from '../types/index'

// ─── Constants (exported for testing) ─────────────────────────────────────────

export const LOOKBACK_DAYS = 7
export const RISK_THRESHOLD = 0.6
export const MIN_WORD_LENGTH = 4
export const SCAN_DAYS = 3

export const STOP_WORDS = new Set([
  'that', 'this', 'with', 'have', 'from', 'they', 'will', 'been',
  'were', 'said', 'each', 'which', 'their', 'time', 'when', 'your',
  'just', 'know', 'into', 'than', 'then', 'some', 'could', 'about',
])

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface WordStats {
  relapseContextCount: number
  cleanContextCount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

// ─── buildWordFlags ───────────────────────────────────────────────────────────

/**
 * Analyzes check-in notes to identify words that appear disproportionately
 * in the days leading up to a relapse. Returns a map of word → WordStats
 * for words that exceed the risk threshold.
 *
 * Preconditions:
 *   - checkIns sorted ascending by date
 *   - LOOKBACK_DAYS > 0
 *
 * Postconditions:
 *   - Returns map of word → { relapseContextCount, cleanContextCount }
 *   - riskScore = relapseContextCount / (relapseContextCount + cleanContextCount + 1)
 *   - Only words with riskScore >= RISK_THRESHOLD are returned
 *   - Only words with >= 2 total occurrences are returned
 *   - Stop words and short words are excluded
 */
export function buildWordFlags(checkIns: CheckIn[]): Map<string, WordStats> {
  const wordStats = new Map<string, WordStats>()

  // Build a date → status lookup for O(1) access
  const dateStatus = new Map<string, 'clean' | 'relapse'>()
  checkIns.forEach(c => dateStatus.set(c.date, c.status))

  checkIns.forEach(checkin => {
    const text = [checkin.note, checkin.relapseReason].filter(Boolean).join(' ')
    if (!text || text.trim().length < 5) return

    // Determine context: is there a relapse within LOOKBACK_DAYS after this note?
    const noteDate = new Date(checkin.date)
    let isPreRelapseContext = false
    for (let d = 1; d <= LOOKBACK_DAYS; d++) {
      const future = new Date(noteDate)
      future.setDate(future.getDate() + d)
      const futureStr = toDateStr(future)
      if (dateStatus.get(futureStr) === 'relapse') {
        isPreRelapseContext = true
        break
      }
    }

    // Tokenize and count
    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w))

    const seen = new Set<string>() // count each word once per check-in
    words.forEach(word => {
      if (seen.has(word)) return
      seen.add(word)

      const existing = wordStats.get(word) ?? { relapseContextCount: 0, cleanContextCount: 0 }
      if (isPreRelapseContext) {
        existing.relapseContextCount++
      } else {
        existing.cleanContextCount++
      }
      wordStats.set(word, existing)
    })
  })

  // Filter to only high-risk words with sufficient evidence
  const result = new Map<string, WordStats>()
  wordStats.forEach((stats, word) => {
    const total = stats.relapseContextCount + stats.cleanContextCount
    if (total < 2) return // need at least 2 occurrences
    const riskScore = stats.relapseContextCount / (total + 1)
    if (riskScore >= RISK_THRESHOLD) {
      result.set(word, stats)
    }
  })

  return result
}

// ─── detectWordRisk ───────────────────────────────────────────────────────────

/**
 * Scans recent check-in notes for words that match the user's word flags.
 *
 * Preconditions:
 *   - recentCheckIns are the last SCAN_DAYS days of check-ins
 *   - wordFlags is loaded from relapse_word_flags table
 *
 * Postconditions:
 *   - Returns list of WordRiskSignal for each flagged word found
 *   - Sorted by riskScore descending
 *   - Empty list if no risk words detected
 */
export function detectWordRisk(
  recentCheckIns: CheckIn[],
  wordFlags: RelapseWordFlag[]
): WordRiskSignal[] {
  const signals: WordRiskSignal[] = []

  const recentText = recentCheckIns
    .slice(-SCAN_DAYS)
    .flatMap(c => [c.note, c.relapseReason])
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')

  wordFlags.forEach(flag => {
    const regex = new RegExp(`\\b${flag.word}\\b`, 'g')
    const matches = recentText.match(regex)
    if (matches && matches.length > 0) {
      signals.push({
        word: flag.word,
        riskScore: Math.min(flag.frequency / 10, 1.0),
        recentOccurrences: matches.length,
        historicalFrequency: flag.frequency,
      })
    }
  })

  return signals.sort((a, b) => b.riskScore - a.riskScore)
}
