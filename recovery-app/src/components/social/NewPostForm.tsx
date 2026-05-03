import { useState } from 'react'
import type { PostType, Post } from '../../types/index'

interface NewPostFormProps {
  onSubmit: (type: PostType, content: string) => Promise<Post | null>
}

const POST_TYPES: { key: PostType; label: string; emoji: string }[] = [
  { key: 'milestone', label: 'Milestone', emoji: '🏆' },
  { key: 'happy', label: 'Good Thing', emoji: '😊' },
  { key: 'vent', label: 'Vent', emoji: '💨' },
]

export function NewPostForm({ onSubmit }: NewPostFormProps) {
  const [type, setType] = useState<PostType>('milestone')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    setError(null)

    const result = await onSubmit(type, content.trim())

    if (result) {
      setContent('')
      setType('milestone')
    } else {
      setError('Failed to create post — try again')
    }
    setSubmitting(false)
  }

  return (
    <div
      style={{
        padding: '14px 16px',
        marginBottom: '16px',
        background: 'var(--color-surface)',
        borderRadius: '10px',
        border: '1px solid var(--color-border)',
      }}
    >
      <h4 style={{ margin: '0 0 10px', fontSize: '0.95em', color: 'var(--color-text)' }}>New Post</h4>

      {/* Post type selection */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {POST_TYPES.map((pt) => (
          <button
            key={pt.key}
            type="button"
            onClick={() => setType(pt.key)}
            style={{
              padding: '5px 12px',
              border: type === pt.key ? '2px solid var(--color-primary, #4f8a6e)' : '1px solid var(--color-border)',
              borderRadius: '16px',
              background: type === pt.key ? 'var(--color-primary, #4f8a6e)' + '15' : 'var(--color-surface)',
              color: type === pt.key ? 'var(--color-primary, #4f8a6e)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85em',
              fontWeight: type === pt.key ? 'bold' : 'normal',
            }}
          >
            {pt.emoji} {pt.label}
          </button>
        ))}
      </div>

      {/* Content textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          type === 'milestone'
            ? "Share a milestone you're proud of…"
            : type === 'happy'
              ? 'Share something good that happened…'
              : 'Let it out — this is a safe space…'
        }
        rows={3}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          fontSize: '0.9em',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />

      {error && (
        <div role="alert" style={{ color: '#e74c3c', fontSize: '0.8em', marginTop: '6px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          style={{
            padding: '8px 20px',
            background: !content.trim() || submitting ? 'var(--color-border)' : 'var(--color-primary, #4f8a6e)',
            color: !content.trim() || submitting ? 'var(--color-text-secondary)' : 'var(--color-primary-contrast, #fff)',
            border: 'none',
            borderRadius: '8px',
            cursor: !content.trim() || submitting ? 'not-allowed' : 'pointer',
            fontSize: '0.9em',
            fontWeight: 'bold',
          }}
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
