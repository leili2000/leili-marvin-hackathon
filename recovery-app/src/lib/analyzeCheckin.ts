/**
 * analyzeCheckin.ts
 *
 * Keyword-based pattern classifier — no API needed, works offline.
 * Swap classify() for an LLM call later when ready.
 *
 * Relapse entry  → extracts triggers  ("things that make you regress")
 * Clean entry    → extracts habits    ("things that help you stay clean")
 */

import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  side: 'regression' | 'protective'
  patternType: string
  tags: string[]
  summary: string
}

// ─── Keyword maps ─────────────────────────────────────────────────────────────

const REGRESSION_PATTERNS: Record<string, string[]> = {
  stress:      ['stress', 'stressed', 'overwhelm', 'pressure', 'deadline', 'work', 'too much', 'burnout'],
  loneliness:  ['alone', 'lonely', 'isolated', 'no one', 'invisible', 'disconnected', 'by myself'],
  grief:       ['grief', 'loss', 'died', 'death', 'anniversary', 'miss', 'missing', 'sad', 'mourning'],
  conflict:    ['argument', 'fight', 'conflict', 'angry', 'anger', 'yelled', 'partner', 'family', 'tension'],
  environment: ['old friend', 'using friend', 'place', 'neighborhood', 'bar', 'party', 'smell', 'saw'],
  exhaustion:  ['tired', 'exhausted', 'sleep', 'insomnia', 'no energy', 'drained', "couldn't sleep"],
  celebration: ['celebrate', 'happy', 'good news', 'promotion', 'birthday', 'wedding', 'event'],
  boredom:     ['bored', 'boredom', 'nothing to do', 'empty', 'numb', 'restless'],
}

const PROTECTIVE_PATTERNS: Record<string, string[]> = {
  support:     ['sponsor', 'meeting', 'called', 'talked', 'friend', 'family', 'group', 'reached out', 'connected'],
  exercise:    ['run', 'ran', 'walk', 'walked', 'gym', 'workout', 'exercise', 'bike', 'swim', 'yoga'],
  routine:     ['routine', 'schedule', 'morning', 'structure', 'plan', 'kept busy', 'stayed busy'],
  mindfulness: ['meditat', 'breath', 'pause', 'journal', 'wrote', 'reflect', 'present', 'calm', 'grounded'],
  purpose:     ['kids', 'family', 'goal', 'reason', 'worth it', 'future', 'motivated'],
  self_care:   ['sleep', 'rest', 'ate', 'food', 'shower', 'outside', 'nature', 'music', 'read'],
  avoidance:   ['avoided', 'stayed away', 'left', "didn't go", 'said no', 'removed myself'],
}

const SUMMARIES: Record<string, string> = {
  // regression
  stress:      'Stress and pressure appear to have been a factor.',
  loneliness:  'Feelings of isolation and loneliness were present.',
  grief:       'Grief or unprocessed loss played a role.',
  conflict:    'Relationship tension or conflict was a trigger.',
  environment: 'Environmental cues or people from the past were involved.',
  exhaustion:  'Physical exhaustion lowered resilience.',
  celebration: 'A positive event lowered the guard.',
  boredom:     'Boredom or emotional emptiness was a factor.',
  // protective
  support:     'Reaching out to others helped stay grounded.',
  exercise:    'Physical activity provided a healthy outlet.',
  routine:     'Having structure and routine made a difference.',
  mindfulness: 'Mindfulness or reflection helped stay present.',
  purpose:     'A sense of purpose and meaning provided motivation.',
  self_care:   'Taking care of basic needs supported recovery.',
  avoidance:   'Actively avoiding triggers helped stay clean.',
}

// ─── Classifier ───────────────────────────────────────────────────────────────

function classify(status: 'clean' | 'relapse', text: string): AnalysisResult {
  const lower = text.toLowerCase()
  const patterns = status === 'relapse' ? REGRESSION_PATTERNS : PROTECTIVE_PATTERNS
  const side: 'regression' | 'protective' = status === 'relapse' ? 'regression' : 'protective'

  let bestPattern = ''
  let bestScore = 0
  const matchedTags: string[] = []

  for (const [pattern, keywords] of Object.entries(patterns)) {
    const matches = keywords.filter((kw) => lower.includes(kw))
    if (matches.length > bestScore) {
      bestScore = matches.length
      bestPattern = pattern
    }
    if (matches.length > 0) matchedTags.push(...matches.slice(0, 2))
  }

  if (!bestPattern) {
    bestPattern = status === 'relapse' ? 'stress' : 'self_care'
  }

  const tags = [...new Set(matchedTags)].slice(0, 4)

  return {
    side,
    patternType: bestPattern,
    tags: tags.length > 0 ? tags : [bestPattern],
    summary: SUMMARIES[bestPattern] ?? `${bestPattern} was identified as a key factor.`,
  }
}

// ─── Supabase upsert ──────────────────────────────────────────────────────────

async function upsertPattern(
  userId: string,
  checkinId: string,
  result: AnalysisResult
): Promise<void> {
  const { data: existing } = await supabase
    .from('relapse_patterns')
    .select('id, frequency')
    .eq('user_id', userId)
    .eq('pattern_type', result.patternType)
    .eq('side', result.side)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('relapse_patterns')
      .update({
        frequency: existing.frequency + 1,
        description: result.summary,
        tags: result.tags,
        last_seen: new Date().toISOString().split('T')[0],
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('relapse_patterns').insert({
      user_id: userId,
      pattern_type: result.patternType,
      side: result.side,
      description: result.summary,
      frequency: 1,
      tags: result.tags,
      last_seen: new Date().toISOString().split('T')[0],
    })
  }

  await supabase
    .from('checkins')
    .update({ ai_tags: result.tags, ai_processed: true })
    .eq('id', checkinId)
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Analyzes a check-in and upserts the pattern into Supabase.
 * Uses local keyword matching — swap classify() for an LLM call when ready.
 */
export async function analyzeCheckin(
  userId: string,
  checkinId: string,
  status: 'clean' | 'relapse',
  text: string
): Promise<void> {
  const trimmed = text.trim()
  if (trimmed.length < 5) return

  const result = classify(status, trimmed)
  await upsertPattern(userId, checkinId, result)
}
