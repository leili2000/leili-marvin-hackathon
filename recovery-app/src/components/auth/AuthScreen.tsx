import { useState, type FormEvent } from 'react'
import { ColorPicker } from './ColorPicker'
import { isValidHex } from '../../lib/theme'

interface AuthScreenProps {
  onSignIn: (username: string, password: string) => Promise<void>
  onSignUp: (
    username: string,
    password: string,
    recoveryStartDate: string,
    favoriteColor: string
  ) => Promise<void>
  error: string | null
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function SignInForm({
  onSignIn,
  error,
}: {
  onSignIn: AuthScreenProps['onSignIn']
  error: string | null
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSignIn(username, password)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2>Sign In</h2>

      {error && (
        <div role="alert" style={{ color: '#e74c3c', fontSize: '0.9em' }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="signin-username">Username</label>
        <input
          id="signin-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>

      <div>
        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>

      <button type="submit" disabled={submitting} style={{ padding: '10px', cursor: 'pointer' }}>
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

function SignUpForm({
  onSignUp,
  error,
}: {
  onSignUp: AuthScreenProps['onSignUp']
  error: string | null
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [recoveryStartDate, setRecoveryStartDate] = useState(todayStr())
  const [favoriteColor, setFavoriteColor] = useState('#4f8a6e')
  const [colorError, setColorError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setColorError(null)

    if (!isValidHex(favoriteColor)) {
      setColorError('Please enter a valid hex color (e.g. #4f8a6e)')
      return
    }

    setSubmitting(true)
    try {
      await onSignUp(username, password, recoveryStartDate, favoriteColor)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2>Sign Up</h2>

      {error && (
        <div role="alert" style={{ color: '#e74c3c', fontSize: '0.9em' }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>

      <div>
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>

      <div>
        <label htmlFor="signup-start-date">Recovery Start Date</label>
        <input
          id="signup-start-date"
          type="date"
          value={recoveryStartDate}
          onChange={(e) => setRecoveryStartDate(e.target.value)}
          max={todayStr()}
          required
          style={{ display: 'block', width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>

      <div>
        <label>Favorite Color</label>
        <div style={{ marginTop: '4px' }}>
          <ColorPicker value={favoriteColor} onChange={setFavoriteColor} />
        </div>
        {colorError && (
          <div role="alert" style={{ color: '#e74c3c', fontSize: '0.85em', marginTop: '4px' }}>
            {colorError}
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting} style={{ padding: '10px', cursor: 'pointer' }}>
        {submitting ? 'Creating account…' : 'Sign Up'}
      </button>
    </form>
  )
}

export function AuthScreen({ onSignIn, onSignUp, error }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Recovery Place</h1>

      {mode === 'signin' ? (
        <>
          <SignInForm onSignIn={onSignIn} error={error} />
          <p style={{ textAlign: 'center', marginTop: '16px' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{
                background: 'none',
                border: 'none',
                color: '#5b8fb9',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Sign up
            </button>
          </p>
        </>
      ) : (
        <>
          <SignUpForm onSignUp={onSignUp} error={error} />
          <p style={{ textAlign: 'center', marginTop: '16px' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signin')}
              style={{
                background: 'none',
                border: 'none',
                color: '#5b8fb9',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Sign in
            </button>
          </p>
        </>
      )}
    </div>
  )
}
