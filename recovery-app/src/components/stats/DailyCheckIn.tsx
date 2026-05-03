import { useState } from 'react'
import type { CheckIn } from '../../types/index'

interface DailyCheckInProps {
  todayCheckIn: CheckIn | null
  onSubmit: (status: 'clean' | 'relapse', note: string, relapseReason: string) => Promise<void>
}

export function DailyCheckIn({ todayCheckIn, onSubmit }: DailyCheckInProps) {
  const [status, setStatus] = useState<'clean' | 'relapse'>(todayCheckIn?.status ?? 'clean')
  const [note, setNote] = useState(todayCheckIn?.note ?? '')
  const [relapseReason, setRelapseReason] = useState(todayCheckIn?.relapseReason ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(!todayCheckIn)

  if (todayCheckIn && !editing) {
    return (
      <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 8px' }}>Today's Check-In</h3>
        <p style={{ margin: '0 0 4px' }}>
          Status:{' '}
          <span
            style={{
              fontWeight: 'bold',
              color: todayCheckIn.status === 'clean' ? '#27ae60' : '#e74c3c',
            }}
          >
            {todayCheckIn.status === 'clean' ? '✓ Clean' : '✗ Relapse'}
          </span>
        </p>
        {todayCheckIn.note && (
          <p style={{ margin: '0 0 4px', fontSize: '0.9em', color: '#555' }}>
            Note: {todayCheckIn.note}
          </p>
        )}
        {todayCheckIn.relapseReason && (
          <p style={{ margin: '0 0 4px', fontSize: '0.9em', color: '#555' }}>
            Reason: {todayCheckIn.relapseReason}
          </p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            marginTop: '8px',
            padding: '6px 14px',
            background: 'none',
            border: '1px solid #999',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      </div>
    )
  }

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(status, note, relapseReason)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save check-in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 12px' }}>Daily Check-In</h3>

      {error && (
        <div role="alert" style={{ color: '#e74c3c', fontSize: '0.9em', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setStatus('clean')}
          style={{
            flex: 1,
            padding: '10px',
            border: status === 'clean' ? '2px solid #27ae60' : '2px solid #ddd',
            borderRadius: '6px',
            background: status === 'clean' ? '#e8f8f0' : '#fff',
            cursor: 'pointer',
            fontWeight: status === 'clean' ? 'bold' : 'normal',
          }}
        >
          ✓ Clean
        </button>
        <button
          type="button"
          onClick={() => setStatus('relapse')}
          style={{
            flex: 1,
            padding: '10px',
            border: status === 'relapse' ? '2px solid #e74c3c' : '2px solid #ddd',
            borderRadius: '6px',
            background: status === 'relapse' ? '#fdecea' : '#fff',
            cursor: 'pointer',
            fontWeight: status === 'relapse' ? 'bold' : 'normal',
          }}
        >
          ✗ Relapse
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="checkin-note" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
          Note (optional)
        </label>
        <textarea
          id="checkin-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '8px', resize: 'vertical' }}
        />
      </div>

      {status === 'relapse' && (
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="checkin-reason" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
            Relapse reason (optional)
          </label>
          <textarea
            id="checkin-reason"
            value={relapseReason}
            onChange={(e) => setRelapseReason(e.target.value)}
            rows={2}
            style={{ width: '100%', padding: '8px', resize: 'vertical' }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          padding: '10px 20px',
          background: 'var(--color-primary, #4f8a6e)',
          color: 'var(--color-primary-contrast, #fff)',
          border: 'none',
          borderRadius: '6px',
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Saving…' : 'Save Check-In'}
      </button>
    </div>
  )
}
