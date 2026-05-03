import type {
  CheckIn,
  RelapseWordFlag,
  HappyItem,
  RelapseRiskAssessment,
} from '../types/index'
import { predictNumerical } from './predictRelapse'
import { detectWordRisk, SCAN_DAYS } from './analyzeCheckin'
import { buildNudgeAction } from './nudge'

const MS_PER_DAY = 86_400_000

/**
 * assessRelapseRisk
 *
 * Combines numerical prediction and word-flag detection into a single
 * risk assessment used by the nudge system.
 *
 * Preconditions:
 *   - checkIns sorted ascending
 *   - wordFlags loaded from DB
 *   - today is YYYY-MM-DD
 *
 * Postconditions:
 *   - overallRisk reflects the highest signal from either method
 *   - suggestedAction is null when overallRisk = 'none'
 *   - suggestedAction is non-null when overallRisk >= 'medium'
 */
export function assessRelapseRisk(
  checkIns: CheckIn[],
  wordFlags: RelapseWordFlag[],
  happyItems: HappyItem[],
  today: string
): RelapseRiskAssessment {
  // 1. Get numerical prediction
  const numerical = predictNumerical(checkIns, today)

  // 2. Filter check-ins to the last SCAN_DAYS (3) days
  const todayMs = new Date(today).getTime()
  const recentCheckIns = checkIns.filter(c => {
    const dayMs = new Date(c.date).getTime()
    return (todayMs - dayMs) / MS_PER_DAY <= SCAN_DAYS
  })

  // 3. Detect word risk signals from recent check-ins
  const wordSignals = detectWordRisk(recentCheckIns, wordFlags)
  const triggeringWords = wordSignals.map(s => s.word)

  // 4. Determine overall risk level using nearestDaysUntil (bimodal-aware)
  let overallRisk: RelapseRiskAssessment['overallRisk'] = 'none'

  const daysUntil = numerical.nearestDaysUntil

  if (daysUntil !== null && daysUntil <= 3) {
    overallRisk = numerical.confidence === 'high' ? 'high' : 'medium'
  } else if (daysUntil !== null && daysUntil <= 7) {
    overallRisk = 'low'
  }

  // Word signal overrides
  if (wordSignals.length >= 3) {
    overallRisk = 'high'
  } else if (wordSignals.length >= 1 && overallRisk === 'none') {
    overallRisk = 'low'
  } else if (wordSignals.length >= 1) {
    overallRisk = 'medium'
  }

  // 5. Build suggested action
  const suggestedAction =
    overallRisk === 'none' ? null : buildNudgeAction(overallRisk, happyItems)

  return {
    overallRisk,
    numerical,
    wordSignals,
    triggeringWords,
    suggestedAction,
  }
}
