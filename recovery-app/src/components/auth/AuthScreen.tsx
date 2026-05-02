import React, { useState } from 'react'
import { ColorPicker, applyThemeColor } from '../ColorPicker'

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (
    email: string,
    password: string,
    username: string,
    recoveryStartDate: string,
    themeColor: string
  ) => Promise<void>
}

type AuthMode = 'signin' | 'signup'
type SignupStep = 'form' | 'color'

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp }) => {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [step, setStep] = useState<SignupStep>('form')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [recoveryStartDate, setRecoveryStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [themeColor, setThemeColor] = useState('forest')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleColorChange = (colorId: string) => {
    setThemeColor(colorId)
    applyThemeColor(colorId) // live preview
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'signin') {
      setLoading(true)
      try {
        await onSignIn(email, password)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setLoading(false)
      }
      return
    }

    // Signup — go to color picker step first
    if (!username.trim()) {
      setError('Please enter a display name.')
      return
    }
    setStep('color')
  }

  const handleColorSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      await onSignUp(email, password, username.trim(), recoveryStartDate, themeColor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStep('form') // go back on error
    } finally {
      setLoading(false)
    }
  }

  // ─── Color picker step ────────────────────────────────────────
  if (mode === 'signup' && step === 'color') {
    return (
      <div className="auth-screen">
        <div className="auth-card auth-card--color">
          <div className="auth-card__brand">
            <span className="auth-card__logo">🎨</span>
            <h1 className="auth-card__title">Make it yours</h1>
            <p className="auth-card__tagline">Pick a color that feels right for your journey.</p>
          </div>

          <ColorPicker
            selected={themeColor}
            onChange={handleColorChange}
            label="Your theme color"
          />

          {error && <p className="auth-form__error">{error}</p>}

          <div className="auth-color-actions">
            <button
              className="btn btn--primary auth-form__submit"
              onClick={handleColorSubmit}
              disabled={loading}
            >
              {loading ? 'Creating your account...' : "Let's go →"}
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => setStep('form')}
              disabled={loading}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main auth form ───────────────────────────────────────────
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__logo">🌱</span>
          <h1 className="auth-card__title">Recover</h1>
          <p className="auth-card__tagline">You're not alone.</p>
        </div>

        <div className="auth-card__tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'auth-tab--active' : ''}`}
            onClick={() => { setMode('signin'); setError(null); setStep('form') }}
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
            onClick={() => { setMode('signup'); setError(null); setStep('form') }}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleFormSubmit}>
          {mode === 'signup' && (
            <div className="auth-form__field">
              <label className="form-label" htmlFor="username">Display name</label>
              <input
                id="username"
                className="input"
                type="text"
                placeholder="What should we call you?"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-form__field">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div className="auth-form__field">
              <label className="form-label" htmlFor="recovery-start">
                When did your recovery start?
              </label>
              <p className="auth-form__hint">
                Just for your own tracking — you can change it later.
              </p>
              <input
                id="recovery-start"
                className="input"
                type="date"
                value={recoveryStartDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setRecoveryStartDate(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className="auth-form__error">{error}</p>}

          <button className="btn btn--primary auth-form__submit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign in'
              : 'Next →'}
          </button>
        </form>
      </div>
    </div>
  )
}
