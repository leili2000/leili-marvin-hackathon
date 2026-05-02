import React, { useState } from 'react'
import type { CheckIn, DayStatus, TrackingMode } from '../../types'
import { mockCheckIns, mockRelapsePatterns, mockUser } from '../../data/mockData'
import { CalendarWidget } from './CalendarWidget'
import { DailyCheckIn } from './DailyCheckIn'
import { AutoIncrementPrompt } from './AutoIncrementPrompt'
import { PatternInsights } from './PatternInsights'
import { TrackingModeSelector } from './TrackingModeSelector'

type StatsView = 'overview' | 'calendar' | 'patterns' | 'settings'

export const StatsTab: React.FC = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(mockCheckIns)
  const [trackingMode, setTrackingMode] = useState<TrackingMode>(mockUser.trackingMode)
  const [view, setView] = useState<StatsView>('overview')
  const [lastPromptDate, setLastPromptDate] = useState<string | null>(null)

  const today = '2026-05-02'

  const todayCheckIn = checkIns.find((c) => c.date === today) ?? null

  const totalCleanDays = checkIns.filter((c) => c.status === 'clean').length
  const totalDays = checkIns.length
  const relapseCount = checkIns.filter((c) => c.status === 'relapse').length

  // Current streak: count backwards from today
  const getCurrentStreak = () => {
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

  const currentStreak = getCurrentStreak()

  const handleDayUpdate = (date: string, status: DayStatus) => {
    setCheckIns((prev) => {
      const existing = prev.find((c) => c.date === date)
      if (status === null) {
        return prev.filter((c) => c.date !== date)
      }
      if (existing) {
        return prev.map((c) => c.date === date ? { ...c, status: status as 'clean' | 'relapse' } : c)
      }
      return [...prev, {
        id: `checkin-${Date.now()}`,
        userId: mockUser.id,
        date,
        status: status as 'clean' | 'relapse',
        note: null,
        relapseReason: null,
      }]
    })
  }

  const handleDailyCheckIn = (
    status: 'clean' | 'relapse',
    note: string,
    relapseReason: string
  ) => {
    setCheckIns((prev) => {
      const existing = prev.find((c) => c.date === today)
      const entry: CheckIn = {
        id: existing?.id ?? `checkin-${Date.now()}`,
        userId: mockUser.id,
        date: today,
        status,
        note: note || null,
        relapseReason: relapseReason || null,
      }
      if (existing) return prev.map((c) => c.date === today ? entry : c)
      return [...prev, entry]
    })
  }

  const handleAutoConfirm = (note: string) => {
    setLastPromptDate(today)
    handleDailyCheckIn('clean', note, '')
  }

  const handleAutoRelapse = (reason: string) => {
    setLastPromptDate(today)
    handleDailyCheckIn('relapse', '', reason)
  }

  const recoveryStart = new Date(mockUser.recoveryStartDate)
  const daysSinceStart = Math.floor(
    (new Date(today).getTime() - recoveryStart.getTime()) / 86400000
  )

  return (
    <div className="stats-tab">
      {/* Sub-nav */}
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

      {/* Overview */}
      {view === 'overview' && (
        <div className="stats-tab__overview">
          <div className="overview-stats">
            <div className="stat-card stat-card--hero">
              <span className="stat-card__value">{totalCleanDays}</span>
              <span className="stat-card__label">total clean days</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{currentStreak}</span>
              <span className="stat-card__label">current streak</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{daysSinceStart}</span>
              <span className="stat-card__label">days since you started</span>
            </div>
          </div>

          <div className="overview-checkin">
            {trackingMode === 'daily_checkin' ? (
              <DailyCheckIn
                todayCheckIn={todayCheckIn}
                onSubmit={handleDailyCheckIn}
              />
            ) : (
              <AutoIncrementPrompt
                cleanDays={totalCleanDays}
                lastPromptDate={lastPromptDate}
                onConfirm={handleAutoConfirm}
                onRelapse={handleAutoRelapse}
              />
            )}
          </div>
        </div>
      )}

      {/* Calendar */}
      {view === 'calendar' && (
        <div className="stats-tab__calendar">
          <p className="stats-tab__section-note">
            Your full history. Click a day to cycle through: clean → relapse → clear.
          </p>
          <CalendarWidget checkIns={checkIns} onDayUpdate={handleDayUpdate} />
        </div>
      )}

      {/* Patterns */}
      {view === 'patterns' && (
        <PatternInsights
          patterns={mockRelapsePatterns}
          totalCleanDays={totalCleanDays}
          totalDays={totalDays}
          relapseCount={relapseCount}
        />
      )}

      {/* Settings */}
      {view === 'settings' && (
        <div className="stats-tab__settings">
          <TrackingModeSelector
            current={trackingMode}
            onChange={setTrackingMode}
          />
          <div className="settings-info">
            <p>
              <strong>Recovery start date:</strong>{' '}
              {new Date(mockUser.recoveryStartDate).toLocaleDateString('en-US', {
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
