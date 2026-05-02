import React from 'react'
import type { Reply } from '../../types'

interface InboxPanelProps {
  replies: Reply[]
}

export const InboxPanel: React.FC<InboxPanelProps> = ({ replies }) => {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (replies.length === 0) {
    return (
      <div className="inbox-panel inbox-panel--empty">
        <p>No replies yet. When someone responds to your posts, you'll see them here.</p>
      </div>
    )
  }

  return (
    <div className="inbox-panel">
      <h3 className="inbox-panel__title">Private replies to your posts</h3>
      <p className="inbox-panel__note">
        These messages were sent directly to you — only you can see them.
      </p>
      <div className="inbox-panel__list">
        {replies.map((reply) => (
          <div key={reply.id} className="inbox-item">
            <div className="inbox-item__header">
              <span className="inbox-item__sender">{reply.senderName}</span>
              <span className="inbox-item__time">{timeAgo(reply.createdAt)}</span>
            </div>
            <p className="inbox-item__content">{reply.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
