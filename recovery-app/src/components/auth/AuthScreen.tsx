import React, { useState } from 'react'

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (
    email: string,
    password: string,
    username: string,
    recoveryStartDate: string
  ) => Promise<void>
}

type AuthMode = 'signin' | 'signup'

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp }) => {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [recoveryStartDate, setRecoveryStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        await onSignIn(email, password)
      } else {
        if (!username.trim()) {
          setError('Please enter a display name.')
          setLoading(false)
          return
        }
        await onSignUp(email, password, username.trim(), recoveryStartDate)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

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
            onClick={() => { setMode('signin'); setError(null) }}
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
            onClick={() => { setMode('signup'); setError(null) }}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="auth-form__field">
              <label className="form-label" htmlFor="username">
                Display name
              </label>
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
                This is just for your own tracking — you can change it later.
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
              : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
