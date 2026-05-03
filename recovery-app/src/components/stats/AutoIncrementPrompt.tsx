import { useState } from 'react'

interface AutoIncrementPromptProps {
  lastPromptDate: string | null
  onConfirm: (note: string) => Promise<void>
  onRelapse: (reason: string) => Promise<void>
}

export function AutoIncrementPrompt({ lastPromptDate, onConfirm, onRelapse }: AutoIncrementPromptProps) {
  const today = new Date().toISOString().split('T')[0]
  const alreadyLogged = lastPromptDate === today

  const [showRelapse, setShowRelapse] = useState(false)
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (alreadyLogged) {
    return (
      <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 8px' }}>Today's Status</h3>
        <p style={{ margin: 0, color: '#27ae60', fontWeight: 'bold' }}>
          ✓ Logged for today
        </p>
      </div>
    )
  }

  const handleConfirm = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onConfirm(note)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRelapse = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onRelapse(reason)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log relapse')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 12px' }}>Quick Check-In</h3>

      {error && (
        <div role="alert" style={{ color: '#e74c3c', fontSize: '0.9em', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      {!showRelapse ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <label htmlFor="day-note" style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)' }}>
              How was your day? (optional)
            </label>
            <textarea
              id="day-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything on your mind today…"
              rows={2}
              style={{ width: '100%', padding: '8px', resize: 'vertical', marginTop: '4px' }}
            />
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              padding: '14px',
              background: 'var(--color-primary, #4f8a6e)',
              color: 'var(--color-primary-contrast, #fff)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1em',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Saving…' : '👍 All good'}
          </button>
          <button
            type="button"
            onClick={() => setShowRelapse(true)}
            style={{
              padding: '10px',
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9em',
            }}
          >
            I need to log a relapse
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="relapse-reason" style={{ fontSize: '0.9em' }}>
            What happened? (optional)
          </label>
          <textarea
            id="relapse-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleRelapse}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '10px',
                background: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Saving…' : 'Log Relapse'}
            </button>
            <button
              type="button"
              onClick={() => setShowRelapse(false)}
              style={{
                padding: '10px',
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
