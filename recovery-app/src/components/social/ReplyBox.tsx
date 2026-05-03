import { useState } from 'react'

interface ReplyBoxProps {
  postId: string
  recipientId: string
  onSend: (postId: string, recipientId: string, content: string) => Promise<boolean>
  onCancel: () => void
}

export function ReplyBox({ postId, recipientId, onSend, onCancel }: ReplyBoxProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!content.trim() || sending) return
    setSending(true)
    setError(null)

    const ok = await onSend(postId, recipientId, content.trim())

    if (ok) {
      setSent(true)
      setContent('')
    } else {
      setError("Couldn't send reply — try again")
    }
    setSending(false)
  }

  if (sent) {
    return (
      <div
        style={{
          padding: '8px 12px',
          background: '#e8f5e9',
          borderRadius: '8px',
          fontSize: '0.85em',
          color: '#2e7d32',
          marginTop: '8px',
        }}
      >
        Reply sent ✓
      </div>
    )
  }

  return (
    <div style={{ marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
      <p style={{ fontSize: '0.75em', color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
        Your reply goes directly to this person — no one else will see it.
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply…"
        rows={2}
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          fontSize: '0.85em',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />

      {error && (
        <div role="alert" style={{ color: '#e74c3c', fontSize: '0.8em', marginTop: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || sending}
          style={{
            padding: '6px 14px',
            background: !content.trim() || sending ? 'var(--color-border)' : 'var(--color-primary, #4f8a6e)',
            color: !content.trim() || sending ? 'var(--color-text-secondary)' : 'var(--color-primary-contrast, #fff)',
            border: 'none',
            borderRadius: '6px',
            cursor: !content.trim() || sending ? 'not-allowed' : 'pointer',
            fontSize: '0.85em',
          }}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 14px',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
