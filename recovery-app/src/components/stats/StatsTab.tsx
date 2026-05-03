import { useState, useMemo } from 'react'
import type { TrackingMode, DayStatus } from '../../types/index'
import { supabase as supabaseClient } from '../../lib/supabase'
import { useStats } from '../../hooks/useStats'
import { DailyCheckIn } from './DailyCheckIn'
import { AutoIncrementPrompt } from './AutoIncrementPrompt'
import { CalendarWidget } from './CalendarWidget'
import { DayDetailModal } from './DayDetailModal'
import { HappyList } from './HappyList'
import { PatternInsights } from './PatternInsights'
import { TrackingModeSelector } from './TrackingModeSelector'
import { ColorPicker } from '../auth/ColorPicker'

type StatsPane = 'overview' | 'calendar' | 'happy' | 'patterns' | 'settings'

interface StatsTabProps {
  userId: string
  username: string
  trackingMode: TrackingMode
  recoveryStartDate: string
  favoriteColor: string
  onTrackingModeChange: (mode: TrackingMode) => void
  onColorChange: (color: string) => void
}

const NAV_ITEMS: { key: StatsPane; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'happy', label: 'Happy' },
  { key: 'patterns', label: 'Patterns' },
  { key: 'settings', label: 'Settings' },
]

export function StatsTab({
  userId,
  username,
  trackingMode,
  recoveryStartDate,
  favoriteColor,
  onTrackingModeChange,
  onColorChange,
}: StatsTabProps) {
  const [activePane, setActivePane] = useState<StatsPane>('overview')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const {
    checkIns,
    happyItems,
    patterns,
    riskAssessment,
    loading,
    error,
    saveCheckIn,
    addHappyItem,
    removeHappyItem,
    updateTrackingMode,
  } = useStats(userId)

  // Derived stats
  const today = new Date().toISOString().split('T')[0]

  const todayCheckIn = useMemo(
    () => checkIns.find((ci) => ci.date === today) ?? null,
    [checkIns, today]
  )

  const totalCleanDays = useMemo(
    () => checkIns.filter((ci) => ci.status === 'clean').length,
    [checkIns]
  )

  const totalDays = useMemo(() => {
    const start = new Date(recoveryStartDate)
    const now = new Date(today)
    return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86_400_000) + 1)
  }, [recoveryStartDate, today])

  const relapseCount = useMemo(
    () => checkIns.filter((ci) => ci.status === 'relapse').length,
    [checkIns]
  )

  const lastPromptDate = useMemo(() => {
    if (checkIns.length === 0) return null
    // Find the most recent check-in date
    const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date))
    return sorted[0].date
  }, [checkIns])

  // Calendar handlers
  const handleDayUpdate = async (date: string, status: DayStatus) => {
    if (status === null) {
      // Cycling back to null — we don't delete, just save as clean then relapse then null
      // For simplicity in prototype, we skip null (no delete endpoint exposed)
      // The cycle is: null → clean → relapse → null
      // When null, we don't call saveCheckIn (no way to delete via upsert)
      return
    }
    await saveCheckIn(date, status)
  }

  const handleDaySelect = (date: string) => {
    setSelectedDay(date)
  }

  const handleStartDateChange = async (newDate: string) => {
    await supabaseClient.from('profiles').update({ recovery_start_date: newDate }).eq('id', userId)
    window.location.reload()
  }

  const handleDayDetailSave = async (status: 'clean' | 'relapse', note: string, relapseReason: string) => {
    if (selectedDay) {
      await saveCheckIn(selectedDay, status, note || undefined, relapseReason || undefined)
      setSelectedDay(null)
    }
  }

  // Check-in handlers
  const handleDailyCheckInSubmit = async (status: 'clean' | 'relapse', note: string, relapseReason: string) => {
    await saveCheckIn(today, status, note || undefined, relapseReason || undefined)
  }

  const handleAutoConfirm = async (note: string) => {
    await saveCheckIn(today, 'clean', note || undefined)
  }

  const handleAutoRelapse = async (reason: string) => {
    await saveCheckIn(today, 'relapse', undefined, reason || undefined)
  }

  // Happy item handlers
  const handleAddHappy = async (item: { title: string; description: string | null; energyLevel: number; prepLevel: number }) => {
    await addHappyItem(item.title, item.description ?? undefined, item.energyLevel, item.prepLevel)
  }

  // Tracking mode handler
  const handleModeChange = async (mode: TrackingMode) => {
    await updateTrackingMode(mode)
    onTrackingModeChange(mode)
  }

  // Selected day check-in for modal
  const selectedDayCheckIn = useMemo(
    () => (selectedDay ? checkIns.find((ci) => ci.date === selectedDay) ?? null : null),
    [checkIns, selectedDay]
  )

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading stats…</div>
  }

  return (
    <div>
      {/* Sub-navigation */}
      <nav
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '8px',
          overflowX: 'auto',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActivePane(item.key)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '16px',
              background: activePane === item.key ? 'var(--color-primary, #4f8a6e)' : 'transparent',
              color: activePane === item.key ? 'var(--color-primary-contrast, #fff)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9em',
              fontWeight: activePane === item.key ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {error && (
        <div role="alert" style={{ color: '#e74c3c', fontSize: '0.9em', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      {/* Overview Pane */}
      {activePane === 'overview' && (
        <div>
          <h2 style={{ margin: '0 0 16px' }}>Welcome back, {username}</h2>

          {/* Stat Cards */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '16px',
                background: 'var(--color-primary-light, #e8f5e9)',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--color-primary, #4f8a6e)' }}>
                {totalCleanDays}
              </div>
              <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>Total Clean Days</div>
            </div>
            <div
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '16px',
                background: 'var(--color-surface-hover)',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{totalDays}</div>
              <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>Days Since Start</div>
            </div>
          </div>

          {/* Check-in based on tracking mode */}
          {trackingMode === 'daily_checkin' ? (
            <DailyCheckIn todayCheckIn={todayCheckIn} onSubmit={handleDailyCheckInSubmit} />
          ) : (
            <AutoIncrementPrompt
              lastPromptDate={lastPromptDate}
              onConfirm={handleAutoConfirm}
              onRelapse={handleAutoRelapse}
            />
          )}
        </div>
      )}

      {/* Calendar Pane */}
      {activePane === 'calendar' && (
        <div>
          <CalendarWidget
            checkIns={checkIns}
            recoveryStartDate={recoveryStartDate}
            onDayUpdate={handleDayUpdate}
            onDaySelect={handleDaySelect}
            onStartDateChange={handleStartDateChange}
          />
        </div>
      )}

      {/* Happy Pane */}
      {activePane === 'happy' && (
        <HappyList items={happyItems} onAdd={handleAddHappy} onRemove={removeHappyItem} />
      )}

      {/* Patterns Pane */}
      {activePane === 'patterns' && (
        <PatternInsights
          patterns={patterns}
          totalCleanDays={totalCleanDays}
          totalDays={totalDays}
          relapseCount={relapseCount}
          riskAssessment={riskAssessment ?? undefined}
        />
      )}

      {/* Settings Pane */}
      {activePane === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TrackingModeSelector currentMode={trackingMode} onChange={handleModeChange} />

          <div>
            <h3 style={{ margin: '0 0 12px' }}>App Color</h3>
            <p style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
              Choose a color to personalize the look of the app.
            </p>
            <ColorPicker value={favoriteColor} onChange={onColorChange} />
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetailModal
          date={selectedDay}
          checkIn={selectedDayCheckIn}
          onSave={handleDayDetailSave}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
