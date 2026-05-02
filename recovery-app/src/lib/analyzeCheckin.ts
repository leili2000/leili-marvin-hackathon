/**
 * analyzeCheckin.ts
 *
 * Uses OpenRouter (free tier) to analyze check-in notes.
 * Get a free key at https://openrouter.ai — no credit card needed.
 *
 * Relapse entry  → extracts triggers  ("things that make you regress")
 * Clean entry    → extracts habits    ("things that help you stay clean")
 */

import { supabase } from './supabase'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
// Free model — no credits needed
const MODEL = 'mistralai/mistral-7b-instruct:free'

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

Reply with ONLY this JSON (no explanation, no markdown):
{
  "side": "regression",
  "patternType": "one short label e.g. stress, loneliness, environment, grief, conflict, exhaustion",
  "tags": ["2-4 short trigger words"],
  "summary": "One plain sentence describing what led to the relapse"
}`
  }

  return `You are a compassionate recovery coach. Someone in addiction recovery wrote this about what helped them stay clean today:

"${text}"

Reply with ONLY this JSON (no explanation, no markdown):
{
  "side": "protective",
  "patternType": "one short label e.g. routine, support, exercise, mindfulness, purpose, journaling",
  "tags": ["2-4 short habit words"],
  "summary": "One plain sentence describing what helped them stay clean"
}`
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<AnalysisResult | null> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    console.warn('[analyzeCheckin] No VITE_OPENROUTER_API_KEY — skipping AI analysis')
    return null
  }

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      console.error('[analyzeCheckin] OpenRouter error:', res.status, await res.text())
      return null
    }

    const json = await res.json()
    const raw: string = json?.choices?.[0]?.message?.content ?? ''
    if (!raw) return null

    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned) as AnalysisResult
  } catch (err) {
    console.error('[analyzeCheckin] AI call failed:', err)
    return null
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
 * Fire-and-forget. Call after saving a check-in.
 * Skips silently if text is too short or API key is missing.
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
  const result = await callAI(prompt)
  if (!result) return

  await upsertPattern(userId, checkinId, result)
}
