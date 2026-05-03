import { useState, useEffect } from 'react'
import type { Post } from '../../types/index'
import { timeAgo } from './timeAgo'
import { ReplyBox } from './ReplyBox'

interface PostCardProps {
  post: Post
  currentUserId?: string
  isOwn: boolean
  onReply: (postId: string, recipientId: string, content: string) => Promise<boolean>
  replyCount?: number
  onVentPostViewed?: () => void
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  milestone: { label: '🏆 Milestone', color: '#f39c12' },
  happy: { label: '😊 Good Thing', color: '#27ae60' },
  vent: { label: '💨 Vent', color: '#8e44ad' },
}

export function PostCard({
  post,
  isOwn,
  onReply,
  replyCount,
  onVentPostViewed,
}: PostCardProps) {
  const [showReply, setShowReply] = useState(false)

  // Notify parent when a vent post is rendered
  useEffect(() => {
    if (post.type === 'vent' && onVentPostViewed) {
      onVentPostViewed()
    }
    // Only fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const typeInfo = TYPE_LABELS[post.type] ?? { label: post.type, color: '#555' }

  return (
    <div
      style={{
        padding: '14px 16px',
        marginBottom: '10px',
        background: '#fff',
        borderRadius: '10px',
        border: '1px solid #eee',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header: type badge + anonymous name + time */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '0.75em',
            padding: '2px 8px',
            borderRadius: '10px',
            background: typeInfo.color + '20',
            color: typeInfo.color,
            fontWeight: 'bold',
          }}
        >
          {typeInfo.label}
        </span>
        <span style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#333' }}>
          {post.anonymousName}
        </span>
        <span style={{ fontSize: '0.75em', color: '#999', marginLeft: 'auto' }}>
          {timeAgo(post.createdAt)}
        </span>
      </div>

      {/* Content */}
      <p style={{ margin: '0 0 10px', fontSize: '0.95em', lineHeight: 1.5, color: '#333' }}>
        {post.content}
      </p>

      {/* Footer: reply count (own posts only) + reply button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isOwn && replyCount !== undefined && replyCount > 0 && (
          <span style={{ fontSize: '0.8em', color: '#888' }}>
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
        )}

        {/* Only show reply button for other users' posts */}
        {!isOwn && post.userId && (
          <button
            type="button"
            onClick={() => setShowReply(!showReply)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary, #4f8a6e)',
              cursor: 'pointer',
              fontSize: '0.85em',
              padding: 0,
            }}
          >
            {showReply ? 'Cancel reply' : 'Reply'}
          </button>
        )}
      </div>

      {/* Inline reply box */}
      {showReply && post.userId && (
        <ReplyBox
          postId={post.id}
          recipientId={post.userId}
          onSend={onReply}
          onCancel={() => setShowReply(false)}
        />
      )}
    </div>
  )
}
