import React, { useState } from 'react'
import type { PostType } from '../../types'
import { usePosts } from '../../hooks/usePosts'
import { PostCard } from './PostCard'
import { VentBarrier } from './VentBarrier'
import { NewPostForm } from './NewPostForm'
import { InboxPanel } from './InboxPanel'

interface SocialTabProps {
  currentUserId: string
}

const VENT_LIMIT = 3

type SocialView = 'feed' | 'new-post' | 'inbox'

export const SocialTab: React.FC<SocialTabProps> = ({ currentUserId }) => {
  const { posts, replies, loading, error, createPost, sendReply } = usePosts(currentUserId)
  const [view, setView] = useState<SocialView>('feed')
  const [filter, setFilter] = useState<PostType | 'all'>('all')

  // Vent barrier state
  const [ventBarrierPassed, setVentBarrierPassed] = useState(false)
  const [ventPostsSeen, setVentPostsSeen] = useState(0)
  const [showVentBarrier, setShowVentBarrier] = useState(false)
  const [pendingVentAction, setPendingVentAction] = useState<(() => void) | null>(null)

  const handleReply = async (postId: string, content: string) => {
    // Find the post author to send the reply to them
    const post = posts.find((p) => p.id === postId)
    if (!post) return
    await sendReply(postId, post.userId, content)
  }

  const handleNewPost = async (type: PostType, content: string) => {
    await createPost(type, content)
    setView('feed')
  }

  const handleVentFilterClick = () => {
    if (ventBarrierPassed && ventPostsSeen < VENT_LIMIT) {
      setFilter('vent')
    } else {
      setPendingVentAction(() => () => {
        setFilter('vent')
        setVentBarrierPassed(true)
        setVentPostsSeen(0)
        setShowVentBarrier(false)
      })
      setShowVentBarrier(true)
    }
  }

  const handleVentPostView = () => {
    const newCount = ventPostsSeen + 1
    setVentPostsSeen(newCount)
    if (newCount >= VENT_LIMIT) {
      setVentBarrierPassed(false)
    }
  }

  const filteredPosts = posts.filter((p) => {
    if (filter === 'all') return p.type !== 'vent'
    if (filter === 'vent') return p.type === 'vent'
    return p.type === filter
  })

  const ventPosts = posts.filter((p) => p.type === 'vent')

  if (showVentBarrier) {
    return (
      <div className="social-tab">
        <VentBarrier
          onPass={() => {
            if (pendingVentAction) pendingVentAction()
            setPendingVentAction(null)
          }}
          onDecline={() => {
            setShowVentBarrier(false)
            setPendingVentAction(null)
            setFilter('all')
          }}
        />
      </div>
    )
  }

  if (view === 'new-post') {
    return (
      <div className="social-tab">
        <NewPostForm onSubmit={handleNewPost} onCancel={() => setView('feed')} />
      </div>
    )
  }

  if (view === 'inbox') {
    return (
      <div className="social-tab">
        <div className="social-tab__header">
          <button className="btn btn--ghost btn--sm" onClick={() => setView('feed')}>
            ← Back to feed
          </button>
        </div>
        <InboxPanel replies={replies} />
      </div>
    )
  }

  return (
    <div className="social-tab">
      <div className="social-tab__header">
        <div className="social-tab__actions">
          <button className="btn btn--primary" onClick={() => setView('new-post')}>
            + New post
          </button>
          <button className="btn btn--ghost" onClick={() => setView('inbox')}>
            Inbox {replies.length > 0 && <span className="badge">{replies.length}</span>}
          </button>
        </div>
      </div>

      <div className="social-tab__filters">
        {(['all', 'milestone', 'happy', 'vent'] as const).map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
            onClick={f === 'vent' ? handleVentFilterClick : () => setFilter(f)}
          >
            {f === 'all' && 'All'}
            {f === 'milestone' && '🏆 Milestones'}
            {f === 'happy' && '☀️ Good Things'}
            {f === 'vent' && '💬 Vent Posts'}
          </button>
        ))}
      </div>

      {filter === 'vent' && ventBarrierPassed && (
        <div className="vent-notice">
          <p>
            You're viewing vent posts. These are shared with courage.
            {ventPostsSeen < VENT_LIMIT && (
              <> You can view {VENT_LIMIT - ventPostsSeen} more before we check in again.</>
            )}
          </p>
        </div>
      )}

      {loading && <div className="loading-state">Loading posts...</div>}
      {error && <div className="error-state">Couldn't load posts. {error}</div>}

      <div className="social-tab__feed">
        {!loading && filter !== 'vent' &&
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onReply={handleReply}
            />
          ))}

        {!loading && filter === 'vent' && ventBarrierPassed &&
          ventPosts.slice(0, VENT_LIMIT).map((post, idx) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onReply={(postId, content) => {
                handleReply(postId, content)
                if (idx === 0) handleVentPostView()
              }}
            />
          ))}

        {!loading && filter === 'vent' && !ventBarrierPassed && (
          <div className="empty-state">
            <p>Complete the check-in to view vent posts.</p>
            <button className="btn btn--primary" onClick={handleVentFilterClick}>
              Begin check-in
            </button>
          </div>
        )}

        {!loading && filter !== 'vent' && filteredPosts.length === 0 && (
          <div className="empty-state">
            <p>No posts here yet. Be the first to share.</p>
          </div>
        )}
      </div>
    </div>
  )
}
