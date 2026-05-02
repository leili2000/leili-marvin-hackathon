import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { SocialTab } from './components/social/SocialTab'
import { StatsTab } from './components/stats/StatsTab'
import { AuthScreen } from './components/auth/AuthScreen'
import type { TrackingMode } from './types'
import './App.css'

type Tab = 'social' | 'stats'

function App() {
  const { authState, signIn, signUp, signOut, updateTrackingMode, updateThemeColor } = useAuth()
  const { mode, toggle: toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('social')

  // ─── Loading ──────────────────────────────────────────────────
  if (authState.status === 'loading') {
    return (
      <div className="app-loading">
        <span className="app-loading__logo">🌱</span>
        <p>Loading...</p>
      </div>
    )
  }

  // ─── Unauthenticated ──────────────────────────────────────────
  if (authState.status === 'unauthenticated') {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
      />
    )
  }

  // ─── Authenticated ────────────────────────────────────────────
  const { user } = authState

  const handleTrackingModeChange = async (mode: TrackingMode) => {
    await updateTrackingMode(user.id, mode)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__logo">🌱</span>
            <span className="app-header__name">Recover</span>
          </div>
          <div className="app-header__right">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={mode === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {mode === 'light' ? '🌙' : '☀️'}
            </button>
            <span className="app-header__user">{user.username}</span>
            <button className="btn btn--ghost btn--sm" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <nav className="app-tabs">
        <button
          className={`app-tab ${activeTab === 'social' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          Community
        </button>
        <button
          className={`app-tab ${activeTab === 'stats' ? 'app-tab--active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          My Progress
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'social' ? (
          <SocialTab currentUserId={user.id} />
        ) : (
          <StatsTab
            userId={user.id}
            username={user.username}
            trackingMode={user.trackingMode}
            recoveryStartDate={user.recoveryStartDate}
            themeColor={user.themeColor}
            onTrackingModeChange={handleTrackingModeChange}
            onThemeColorChange={(colorId) => updateThemeColor(user.id, colorId)}
          />
        )}
      </main>
    </div>
  )
}

export default App
