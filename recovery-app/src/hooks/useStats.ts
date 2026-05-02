import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { CheckIn, RelapsePattern, DayStatus } from '../types'

export function useStats(userId: string | null) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [patterns, setPatterns] = useState<RelapsePattern[]>([])
  const [loading, setLoading] = useState(true)

  // ─── Load check-ins ───────────────────────────────────────────
  const fetchCheckIns = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Failed to load check-ins:', error.message)
      setLoading(false)
      return
    }

    const mapped: CheckIn[] = (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      status: row.status as 'clean' | 'relapse',
      note: row.note,
      relapseReason: row.relapse_reason,
    }))

    setCheckIns(mapped)
    setLoading(false)
  }, [userId])

  // ─── Load relapse patterns ────────────────────────────────────
  const fetchPatterns = useCallback(async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('relapse_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('frequency', { ascending: false })

    if (error) {
      console.error('Failed to load patterns:', error.message)
      return
    }

    const mapped: RelapsePattern[] = (data ?? []).map((row) => ({
      id: row.id,
      patternType: row.pattern_type,
      description: row.description,
      frequency: row.frequency,
    }))

    setPatterns(mapped)
  }, [userId])

  useEffect(() => {
    fetchCheckIns()
    fetchPatterns()
  }, [fetchCheckIns, fetchPatterns])

  // ─── Upsert a check-in ────────────────────────────────────────
  const saveCheckIn = async (
    date: string,
    status: 'clean' | 'relapse',
    note: string,
    relapseReason: string
  ): Promise<CheckIn | null> => {
    if (!userId) return null

    const { data, error } = await supabase
      .from('checkins')
      .upsert(
        {
          user_id: userId,
          date,
          status,
          note: note || null,
          relapse_reason: relapseReason || null,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single()

    if (error) {
      console.error('Failed to save check-in:', error.message)
      return null
    }

    const saved: CheckIn = {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      status: data.status as 'clean' | 'relapse',
      note: data.note,
      relapseReason: data.relapse_reason,
    }

    // Update local state
    setCheckIns((prev) => {
      const exists = prev.find((c) => c.date === date)
      if (exists) return prev.map((c) => c.date === date ? saved : c)
      return [...prev, saved].sort((a, b) => a.date.localeCompare(b.date))
    })

    return saved
  }

  // ─── Update a calendar day (click-to-cycle) ───────────────────
  const updateDay = async (date: string, status: DayStatus): Promise<void> => {
    if (!userId) return

    if (status === null) {
      // Delete the entry
      const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('user_id', userId)
        .eq('date', date)

      if (error) {
        console.error('Failed to delete check-in:', error.message)
        return
      }

      setCheckIns((prev) => prev.filter((c) => c.date !== date))
      return
    }

    await saveCheckIn(date, status, '', '')
  }

  // ─── Streak (internal only, not shown to user) ────────────────
  const getCurrentStreak = (today: string): number => {
    let streak = 0
    let current = new Date(today)
    for (let i = 0; i < 1000; i++) {
      const dateStr = current.toISOString().split('T')[0]
      const found = checkIns.find((c) => c.date === dateStr)
      if (!found || found.status !== 'clean') break
      streak++
      current.setDate(current.getDate() - 1)
    }
    return streak
  }

  return {
    checkIns,
    patterns,
    loading,
    saveCheckIn,
    updateDay,
    getCurrentStreak,
    refetchPatterns: fetchPatterns,
  }
}
