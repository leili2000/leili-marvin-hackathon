import type { Reply } from '../../types/index'
import { timeAgo } from './timeAgo'

interface InboxPanelProps {
  replies: Reply[]
  onClose: () => void
}

export function InboxPanel({ replies, onClose }: InboxPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '320px',
        maxWidth: '100vw',
        background: 'var(--color-surface)',
        boxShadow: '-2px 0 12px rgba(0,0,0,0.15)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.1em' }}>Inbox</h3>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2em',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            padding: '4px 8px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Reply list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {replies.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9em', textAlign: 'center', marginTop: '40px' }}>
            No replies yet
          </p>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              style={{
                padding: '12px',
                marginBottom: '8px',
                background: 'var(--color-surface-hover)',
                borderRadius: '8px',
                borderLeft: '3px solid var(--color-primary, #4f8a6e)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontWeight: 'bold', fontSize: '0.85em', color: 'var(--color-text)' }}>
                  {reply.senderName}
                </span>
                <span style={{ fontSize: '0.75em', color: 'var(--color-text-secondary)' }}>
                  {timeAgo(reply.createdAt)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {reply.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
