import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { assessRelapseRisk } from '../lib/assessRisk'
import { buildWordFlags } from '../lib/analyzeCheckin'
import type {
  CheckIn,
  HappyItem,
  RelapsePattern,
  RelapseWordFlag,
  RelapseRiskAssessment,
  TrackingMode,
} from '../types/index'

// ─── DB row → camelCase mappers ───────────────────────────────────────────────

function mapCheckIn(row: Record<string, unknown>): CheckIn {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    status: row.status as 'clean' | 'relapse',
    note: (row.note as string) ?? null,
    relapseReason: (row.relapse_reason as string) ?? null,
    aiTags: (row.ai_tags as string[]) ?? [],
    aiProcessed: (row.ai_processed as boolean) ?? false,
  }
}

function mapHappyItem(row: Record<string, unknown>): HappyItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    energyLevel: row.energy_level as number,
    prepLevel: row.prep_level as number,
    createdAt: row.created_at as string,
  }
}

function mapPattern(row: Record<string, unknown>): RelapsePattern {
  return {
    id: row.id as string,
    patternType: row.pattern_type as string,
    description: row.description as string,
    frequency: row.frequency as number,
    tags: (row.tags as string[]) ?? [],
    lastSeen: (row.last_seen as string) ?? null,
    side: row.side as 'regression' | 'protective',
  }
}

function mapWordFlag(row: Record<string, unknown>): RelapseWordFlag {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    word: row.word as string,
    frequency: row.frequency as number,
    lastSeen: (row.last_seen as string) ?? null,
  }
}

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UseStatsReturn {
  checkIns: CheckIn[]
  happyItems: HappyItem[]
  patterns: RelapsePattern[]
  wordFlags: RelapseWordFlag[]
  riskAssessment: RelapseRiskAssessment | null
  loading: boolean
  error: string | null
  saveCheckIn: (
    date: string,
    status: 'clean' | 'relapse',
    note?: string,
    relapseReason?: string
  ) => Promise<void>
  addHappyItem: (
    title: string,
    description: string | undefined,
    energyLevel: number,
    prepLevel: number
  ) => Promise<void>
  removeHappyItem: (id: string) => Promise<void>
  updateTrackingMode: (mode: TrackingMode) => Promise<void>
  refresh: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStats(userId: string): UseStatsReturn {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [happyItems, setHappyItems] = useState<HappyItem[]>([])
  const [patterns, setPatterns] = useState<RelapsePattern[]>([])
  const [wordFlags, setWordFlags] = useState<RelapseWordFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch functions ───────────────────────────────────────────────────────

  const fetchCheckIns = useCallback(async (uid: string): Promise<CheckIn[]> => {
    const { data, error: fetchError } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: true })

    if (fetchError) throw new Error(fetchError.message)
    return (data ?? []).map(mapCheckIn)
  }, [])

  const fetchHappyItems = useCallback(async (uid: string): Promise<HappyItem[]> => {
    const { data, error: fetchError } = await supabase
      .from('happy_items')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (fetchError) throw new Error(fetchError.message)
    return (data ?? []).map(mapHappyItem)
  }, [])

  const fetchPatterns = useCallback(async (uid: string): Promise<RelapsePattern[]> => {
    const { data, error: fetchError } = await supabase
      .from('relapse_patterns')
      .select('*')
      .eq('user_id', uid)

    if (fetchError) throw new Error(fetchError.message)
    return (data ?? []).map(mapPattern)
  }, [])

  const fetchWordFlags = useCallback(async (uid: string): Promise<RelapseWordFlag[]> => {
    const { data, error: fetchError } = await supabase
      .from('relapse_word_flags')
      .select('*')
      .eq('user_id', uid)

    if (fetchError) throw new Error(fetchError.message)
    return (data ?? []).map(mapWordFlag)
  }, [])

  // ── Load all data ─────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ci, hi, pat, wf] = await Promise.all([
        fetchCheckIns(userId),
        fetchHappyItems(userId),
        fetchPatterns(userId),
        fetchWordFlags(userId),
      ])
      setCheckIns(ci)
      setHappyItems(hi)
      setPatterns(pat)
      setWordFlags(wf)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats data')
    } finally {
      setLoading(false)
    }
  }, [userId, fetchCheckIns, fetchHappyItems, fetchPatterns, fetchWordFlags])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // ── Risk assessment (derived) ─────────────────────────────────────────────

  const riskAssessment = useMemo<RelapseRiskAssessment | null>(() => {
    if (checkIns.length === 0) return null
    const today = new Date().toISOString().split('T')[0]
    return assessRelapseRisk(checkIns, wordFlags, happyItems, today)
  }, [checkIns, wordFlags, happyItems])

  // ── Mutations ─────────────────────────────────────────────────────────────

  const saveCheckIn = useCallback(
    async (
      date: string,
      status: 'clean' | 'relapse',
      note?: string,
      relapseReason?: string
    ) => {
      setError(null)

      const { error: upsertError } = await supabase
        .from('checkins')
        .upsert(
          {
            user_id: userId,
            date,
            status,
            note: note ?? null,
            relapse_reason: relapseReason ?? null,
          },
          { onConflict: 'user_id,date' }
        )

      if (upsertError) {
        setError(upsertError.message)
        return
      }

      // Refresh check-ins to get the updated list
      try {
        const updatedCheckIns = await fetchCheckIns(userId)
        setCheckIns(updatedCheckIns)

        // Fire-and-forget: run pattern analysis and upsert word flags
        void (async () => {
          try {
            const flagMap = buildWordFlags(updatedCheckIns)

            // Upsert each word flag to the DB
            for (const [word, stats] of flagMap) {
              await supabase
                .from('relapse_word_flags')
                .upsert(
                  {
                    user_id: userId,
                    word,
                    frequency: stats.relapseContextCount + stats.cleanContextCount,
                    last_seen: date,
                  },
                  { onConflict: 'user_id,word' }
                )
            }

            // Refresh word flags after upsert
            const updatedFlags = await fetchWordFlags(userId)
            setWordFlags(updatedFlags)
          } catch {
            // Fire-and-forget — silently ignore analysis errors
          }
        })()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh check-ins')
      }
    },
    [userId, fetchCheckIns, fetchWordFlags]
  )

  const addHappyItem = useCallback(
    async (
      title: string,
      description: string | undefined,
      energyLevel: number,
      prepLevel: number
    ) => {
      setError(null)

      // Validate energy and prep levels
      if (
        !Number.isInteger(energyLevel) ||
        energyLevel < 1 ||
        energyLevel > 5
      ) {
        setError('Energy level must be an integer between 1 and 5')
        return
      }
      if (
        !Number.isInteger(prepLevel) ||
        prepLevel < 1 ||
        prepLevel > 5
      ) {
        setError('Prep level must be an integer between 1 and 5')
        return
      }

      const { error: insertError } = await supabase
        .from('happy_items')
        .insert({
          user_id: userId,
          title,
          description: description ?? null,
          energy_level: energyLevel,
          prep_level: prepLevel,
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      // Refresh happy items
      try {
        const updated = await fetchHappyItems(userId)
        setHappyItems(updated)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh happy items')
      }
    },
    [userId, fetchHappyItems]
  )

  const removeHappyItem = useCallback(
    async (id: string) => {
      setError(null)

      const { error: deleteError } = await supabase
        .from('happy_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (deleteError) {
        setError(deleteError.message)
        return
      }

      // Refresh happy items
      try {
        const updated = await fetchHappyItems(userId)
        setHappyItems(updated)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh happy items')
      }
    },
    [userId, fetchHappyItems]
  )

  const updateTrackingMode = useCallback(
    async (mode: TrackingMode) => {
      setError(null)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tracking_mode: mode })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
      }
    },
    [userId]
  )

  return {
    checkIns,
    happyItems,
    patterns,
    wordFlags,
    riskAssessment,
    loading,
    error,
    saveCheckIn,
    addHappyItem,
    removeHappyItem,
    updateTrackingMode,
    refresh: loadAll,
  }
}
