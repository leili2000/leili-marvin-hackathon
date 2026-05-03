import { useState, type FormEvent } from 'react'
import { ColorPicker } from './ColorPicker'
import { isValidHex } from '../../lib/theme'

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (
    email: string,
    password: string,
    username: string,
    recoveryStartDate: string,
    favoriteColor: string
  ) => Promise<void>
  error: string | null
  loading: boolean
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function SignInForm({
  onSignIn,
  error,
  loading,
}: {
  onSignIn: AuthScreenProps['onSignIn']
  error: string | null
  loading: boolean
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSignIn(email, password)
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
        <label htmlFor="signin-email">Email</label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

function SignUpForm({
  onSignUp,
  error,
  loading,
}: {
  onSignUp: AuthScreenProps['onSignUp']
  error: string | null
  loading: boolean
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [recoveryStartDate, setRecoveryStartDate] = useState(todayStr())
  const [favoriteColor, setFavoriteColor] = useState('#4f8a6e')
  const [colorError, setColorError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setColorError(null)

    if (!isValidHex(favoriteColor)) {
      setColorError('Please enter a valid hex color (e.g. #4f8a6e)')
      return
    }

    onSignUp(email, password, username, recoveryStartDate, favoriteColor)
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
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      <button type="submit" disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
        {loading ? 'Creating account…' : 'Sign Up'}
      </button>
    </form>
  )
}

export function AuthScreen({ onSignIn, onSignUp, error, loading }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Recovery App</h1>

      {mode === 'signin' ? (
        <>
          <SignInForm onSignIn={onSignIn} error={error} loading={loading} />
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
          <SignUpForm onSignUp={onSignUp} error={error} loading={loading} />
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
