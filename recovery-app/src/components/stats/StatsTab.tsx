import React, { useState } from 'react'
import type { TrackingMode } from '../../types'
import { useStats } from '../../hooks/useStats'
import { CalendarWidget } from './CalendarWidget'
import { DailyCheckIn } from './DailyCheckIn'
import { AutoIncrementPrompt } from './AutoIncrementPrompt'
import { PatternInsights } from './PatternInsights'
import { TrackingModeSelector } from './TrackingModeSelector'

interface StatsTabProps {
  userId: string
  username: string
  trackingMode: TrackingMode
  recoveryStartDate: string
  onTrackingModeChange: (mode: TrackingMode) => void
}

type StatsView = 'overview' | 'calendar' | 'patterns' | 'settings'

export const StatsTab: React.FC<StatsTabProps> = ({
  userId,
  username,
  trackingMode,
  recoveryStartDate,
  onTrackingModeChange,
}) => {
  const { checkIns, patterns, loading, saveCheckIn, updateDay, getCurrentStreak } =
    useStats(userId)
  const [view, setView] = useState<StatsView>('overview')
  const [lastPromptDate, setLastPromptDate] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const todayCheckIn = checkIns.find((c) => c.date === today) ?? null
  const totalCleanDays = checkIns.filter((c) => c.status === 'clean').length
  const totalDays = checkIns.length
  const relapseCount = checkIns.filter((c) => c.status === 'relapse').length

  const recoveryStart = new Date(recoveryStartDate)
  const daysSinceStart = Math.floor(
    (new Date(today).getTime() - recoveryStart.getTime()) / 86400000
  )

  const handleDailyCheckIn = async (
    status: 'clean' | 'relapse',
    note: string,
    relapseReason: string
  ) => {
    await saveCheckIn(today, status, note, relapseReason)
  }

  const handleAutoConfirm = async (note: string) => {
    setLastPromptDate(today)
    await saveCheckIn(today, 'clean', note, '')
    // Streak tracked internally — not shown to user
    console.debug('[backend] current streak:', getCurrentStreak(today))
  }

  const handleAutoRelapse = async (reason: string) => {
    setLastPromptDate(today)
    await saveCheckIn(today, 'relapse', '', reason)
    console.debug('[backend] streak reset, was:', getCurrentStreak(today))
  }

  return (
    <div className="stats-tab">
      <div className="stats-tab__nav">
        {(['overview', 'calendar', 'patterns', 'settings'] as StatsView[]).map((v) => (
          <button
            key={v}
            className={`stats-nav-btn ${view === v ? 'stats-nav-btn--active' : ''}`}
            onClick={() => setView(v)}
          >
            {v === 'overview' && 'Overview'}
            {v === 'calendar' && 'Calendar'}
            {v === 'patterns' && 'Patterns'}
            {v === 'settings' && 'Settings'}
          </button>
        ))}
      </div>

      {loading && <div className="loading-state">Loading your data...</div>}

      {!loading && view === 'overview' && (
        <div className="stats-tab__overview">
          <div className="overview-stats">
            <div className="stat-card stat-card--hero">
              <span className="stat-card__value">{totalCleanDays}</span>
              <span className="stat-card__label">total clean days</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{daysSinceStart}</span>
              <span className="stat-card__label">days since you started</span>
            </div>
          </div>

          <div className="overview-checkin">
            {trackingMode === 'daily_checkin' ? (
              <DailyCheckIn todayCheckIn={todayCheckIn} onSubmit={handleDailyCheckIn} />
            ) : (
              <AutoIncrementPrompt
                lastPromptDate={lastPromptDate}
                onConfirm={handleAutoConfirm}
                onRelapse={handleAutoRelapse}
              />
            )}
          </div>
        </div>
      )}

      {!loading && view === 'calendar' && (
        <div className="stats-tab__calendar">
          <p className="stats-tab__section-note">
            Your full history. Click a day to cycle through: clean → relapse → clear.
          </p>
          <CalendarWidget checkIns={checkIns} onDayUpdate={updateDay} />
        </div>
      )}

      {!loading && view === 'patterns' && (
        <PatternInsights
          patterns={patterns}
          totalCleanDays={totalCleanDays}
          totalDays={totalDays}
          relapseCount={relapseCount}
        />
      )}

      {view === 'settings' && (
        <div className="stats-tab__settings">
          <TrackingModeSelector current={trackingMode} onChange={onTrackingModeChange} />
          <div className="settings-info">
            <p><strong>Name:</strong> {username}</p>
            <p>
              <strong>Recovery start date:</strong>{' '}
              {new Date(recoveryStartDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
            <p>
              <strong>Tracking mode:</strong>{' '}
              {trackingMode === 'daily_checkin' ? 'Daily check-in' : 'Auto-increment'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
