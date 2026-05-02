import React, { useState } from 'react'
import type { Post } from '../../types'

interface PostCardProps {
  post: Post
  currentUserId: string
  onReply: (postId: string, content: string) => void
}

const POST_TYPE_LABELS: Record<Post['type'], string> = {
  milestone: '🏆 Milestone',
  happy: '☀️ Something Good',
  vent: '💬 Vent',
}

const POST_TYPE_STYLES: Record<Post['type'], string> = {
  milestone: 'post-card--milestone',
  happy: 'post-card--happy',
  vent: 'post-card--vent',
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onReply }) => {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySent, setReplySent] = useState(false)

  const handleSendReply = () => {
    if (!replyText.trim()) return
    onReply(post.id, replyText.trim())
    setReplyText('')
    setReplySent(true)
    setShowReplyBox(false)
    setTimeout(() => setReplySent(false), 3000)
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // Don't show reply button on own posts
  const isOwnPost = post.userId === currentUserId

  return (
    <div className={`post-card ${POST_TYPE_STYLES[post.type]}`}>
      <div className="post-card__header">
        <span className="post-card__type-badge">{POST_TYPE_LABELS[post.type]}</span>
        <span className="post-card__meta">
          {post.anonymousName} · {timeAgo(post.createdAt)}
        </span>
      </div>

      <p className="post-card__content">{post.content}</p>

      <div className="post-card__footer">
        <span className="post-card__reply-count">
          {post.replyCount ?? 0} private {post.replyCount === 1 ? 'reply' : 'replies'}
        </span>

        {!isOwnPost && !replySent && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowReplyBox(!showReplyBox)}
          >
            {showReplyBox ? 'Cancel' : 'Reply privately'}
          </button>
        )}

        {replySent && (
          <span className="post-card__sent-notice">Reply sent ✓</span>
        )}
      </div>

      {showReplyBox && (
        <div className="post-card__reply-box">
          <p className="post-card__reply-note">
            Your reply goes directly to this person — no one else will see it.
          </p>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Write something supportive..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={handleSendReply}
            disabled={!replyText.trim()}
          >
            Send reply
          </button>
        </div>
      )}
    </div>
  )
}
