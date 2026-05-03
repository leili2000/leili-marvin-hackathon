import { useState, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { useStats } from './hooks/useStats'
import { ThemeProvider } from './components/shared/ThemeProvider'
import { RelapseNudge } from './components/shared/RelapseNudge'
import { AuthScreen } from './components/auth/AuthScreen'
import { StatsTab } from './components/stats/StatsTab'
import { SocialTab } from './components/social/SocialTab'
import type { TrackingMode } from './types'

type Tab = 'stats' | 'social'

function AuthenticatedApp({
  userId,
  username,
  trackingMode: initialTrackingMode,
  recoveryStartDate,
  favoriteColor,
  onSignOut,
}: {
  userId: string
  username: string
  trackingMode: TrackingMode
  recoveryStartDate: string
  favoriteColor: string
  onSignOut: () => Promise<void>
}) {
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [trackingMode, setTrackingMode] = useState<TrackingMode>(initialTrackingMode)
  const [currentColor, setCurrentColor] = useState(favoriteColor)
  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  const { riskAssessment } = useStats(userId)

  const handleTrackingModeChange = useCallback((mode: TrackingMode) => {
    setTrackingMode(mode)
  }, [])

  const handleColorChange = useCallback(async (color: string) => {
    setCurrentColor(color)
    // Persist to database
    const { supabase } = await import('./lib/supabase')
    await supabase.from('profiles').update({ favorite_color: color }).eq('id', userId)
  }, [userId])

  const handleDismissNudge = useCallback(() => {
    setNudgeDismissed(true)
  }, [])

  const handleLogMilestone = useCallback(() => {
    setNudgeDismissed(true)
    setActiveTab('social')
  }, [])

  return (
    <ThemeProvider favoriteColor={currentColor}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* App Header */}
        <header
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🌱</span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                }}
              >
                Recovery App
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{username}</span>
              <button
                type="button"
                onClick={onSignOut}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav
          style={{
            display: 'flex',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              color: activeTab === 'stats' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom:
                activeTab === 'stats'
                  ? '2px solid var(--color-primary)'
                  : '2px solid transparent',
            }}
          >
            Stats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              color: activeTab === 'social' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom:
                activeTab === 'social'
                  ? '2px solid var(--color-primary)'
                  : '2px solid transparent',
            }}
          >
            Social
          </button>
        </nav>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            padding: '16px',
          }}
        >
          {activeTab === 'stats' ? (
            <StatsTab
              userId={userId}
              username={username}
              trackingMode={trackingMode}
              recoveryStartDate={recoveryStartDate}
              favoriteColor={currentColor}
              onTrackingModeChange={handleTrackingModeChange}
              onColorChange={handleColorChange}
            />
          ) : (
            <SocialTab currentUserId={userId} />
          )}
        </main>

        {/* Relapse Nudge */}
        {!nudgeDismissed && (
          <RelapseNudge
            assessment={riskAssessment}
            onDismiss={handleDismissNudge}
            onLogMilestone={handleLogMilestone}
          />
        )}
      </div>
    </ThemeProvider>
  )
}

function App() {
  const { user, loading, error, signIn, signUp, signOut } = useAuth()

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#6b6b6b',
        }}
      >
        <span style={{ fontSize: '40px' }}>🌱</span>
        <p>Loading…</p>
      </div>
    )
  }

  // Unauthenticated
  if (!user) {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        error={error}
      />
    )
  }

  // Authenticated
  return (
    <AuthenticatedApp
      userId={user.id}
      username={user.username}
      trackingMode={user.trackingMode}
      recoveryStartDate={user.recoveryStartDate}
      favoriteColor={user.favoriteColor}
      onSignOut={signOut}
    />
  )
}

export default App
