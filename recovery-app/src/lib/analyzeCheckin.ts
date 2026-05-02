/**
 * analyzeCheckin.ts
 *
 * Uses Puter.js (free, no API key) to analyze check-in notes.
 *
 * Relapse entry  → extracts triggers  ("things that make you regress")
 * Clean entry    → extracts habits    ("things that help you stay clean")
 *
 * Results are upserted into relapse_patterns in Supabase.
 */

import puter from 'puter'
import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  side: 'regression' | 'protective'
  patternType: string
  tags: string[]
  summary: string
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

function buildPrompt(status: 'clean' | 'relapse', text: string): string {
  if (status === 'relapse') {
    return `You are a compassionate recovery coach. Someone in addiction recovery wrote this about why they relapsed:

"${text}"

Extract the key triggers. Reply with ONLY this JSON (no explanation, no markdown):
{
  "side": "regression",
  "patternType": "one short label like: stress, loneliness, environment, grief, conflict, exhaustion, celebration",
  "tags": ["2-4 short trigger words"],
  "summary": "One plain sentence describing what led to the relapse"
}`
  }

  return `You are a compassionate recovery coach. Someone in addiction recovery wrote this about what helped them stay clean today:

"${text}"

Extract the key protective habits or factors. Reply with ONLY this JSON (no explanation, no markdown):
{
  "side": "protective",
  "patternType": "one short label like: routine, support, exercise, mindfulness, purpose, journaling, self-care",
  "tags": ["2-4 short habit words"],
  "summary": "One plain sentence describing what helped them stay clean"
}`
}

// ─── Puter AI call ────────────────────────────────────────────────────────────

async function callPuterAI(prompt: string): Promise<AnalysisResult | null> {
  try {
    // puter.ai.chat returns a response object with .message.content
    const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' })
    const raw: string = response?.message?.content ?? response

    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as AnalysisResult
  } catch (err) {
    console.error('[analyzeCheckin] Puter AI call failed:', err)
    return null
  }
}

// ─── Supabase upsert ──────────────────────────────────────────────────────────

async function upsertPattern(
  userId: string,
  checkinId: string,
  result: AnalysisResult
): Promise<void> {
  // If same pattern type + side already exists for this user, increment frequency
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

  // Mark checkin as processed so we don't re-analyze on edits
  await supabase
    .from('checkins')
    .update({ ai_tags: result.tags, ai_processed: true })
    .eq('id', checkinId)
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fire-and-forget. Call this after saving a check-in.
 * Skips silently if text is too short or AI fails.
 */
export async function analyzeCheckin(
  userId: string,
  checkinId: string,
  status: 'clean' | 'relapse',
  text: string
): Promise<void> {
  const trimmed = text.trim()
  if (trimmed.length < 10) return

  const prompt = buildPrompt(status, trimmed)
  const result = await callPuterAI(prompt)
  if (!result) return

  await upsertPattern(userId, checkinId, result)
}
