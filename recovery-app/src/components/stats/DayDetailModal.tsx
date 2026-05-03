import { useState } from 'react'
import type { CheckIn } from '../../types/index'

interface DayDetailModalProps {
  date: string
  checkIn: CheckIn | null
  onSave: (status: 'clean' | 'relapse', note: string, relapseReason: string) => void
  onClose: () => void
}

export function DayDetailModal({ date, checkIn, onSave, onClose }: DayDetailModalProps) {
  const [status, setStatus] = useState<'clean' | 'relapse'>(checkIn?.status ?? 'clean')
  const [note, setNote] = useState(checkIn?.note ?? '')
  const [relapseReason, setRelapseReason] = useState(checkIn?.relapseReason ?? '')

  const handleSave = () => {
    onSave(status, note, relapseReason)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          padding: '24px',
          width: '90%',
          maxWidth: '400px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px' }}>
          {new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => setStatus('clean')}
            style={{
              flex: 1,
              padding: '8px',
              border: status === 'clean' ? '2px solid #27ae60' : '2px solid #ddd',
              borderRadius: '6px',
              background: status === 'clean' ? '#e8f8f0' : '#fff',
              cursor: 'pointer',
            }}
          >
            ✓ Clean
          </button>
          <button
            type="button"
            onClick={() => setStatus('relapse')}
            style={{
              flex: 1,
              padding: '8px',
              border: status === 'relapse' ? '2px solid #e74c3c' : '2px solid #ddd',
              borderRadius: '6px',
              background: status === 'relapse' ? '#fdecea' : '#fff',
              cursor: 'pointer',
            }}
          >
            ✗ Relapse
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="modal-note" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
            Note
          </label>
          <textarea
            id="modal-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            style={{ width: '100%', padding: '8px', resize: 'vertical' }}
          />
        </div>

        {status === 'relapse' && (
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="modal-reason" style={{ display: 'block', marginBottom: '4px', fontSize: '0.9em' }}>
              Relapse reason
            </label>
            <textarea
              id="modal-reason"
              value={relapseReason}
              onChange={(e) => setRelapseReason(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: '8px', resize: 'vertical' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              background: 'var(--color-primary, #4f8a6e)',
              color: 'var(--color-primary-contrast, #fff)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
