import React, { useState } from 'react'
import type { Post, PostType } from '../../types'
import { mockPosts, mockReplies, anonymousNames } from '../../data/mockData'
import { PostCard } from './PostCard'
import { VentBarrier } from './VentBarrier'
import { NewPostForm } from './NewPostForm'
import { InboxPanel } from './InboxPanel'

const CURRENT_USER_ID = 'user-001'
const VENT_LIMIT = 3

type SocialView = 'feed' | 'new-post' | 'inbox'

export const SocialTab: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [replies] = useState(mockReplies)
  const [view, setView] = useState<SocialView>('feed')
  const [filter, setFilter] = useState<PostType | 'all'>('all')

  // Vent barrier state
  const [ventBarrierPassed, setVentBarrierPassed] = useState(false)
  const [ventPostsSeen, setVentPostsSeen] = useState(0)
  const [showVentBarrier, setShowVentBarrier] = useState(false)
  const [pendingVentAction, setPendingVentAction] = useState<(() => void) | null>(null)

  const handleReply = (postId: string, content: string) => {
    // In production this would call Supabase
    console.log('Reply sent to post', postId, ':', content)
  }

  const handleNewPost = (type: PostType, content: string) => {
    const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)]
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: CURRENT_USER_ID,
      type,
      content,
      createdAt: new Date().toISOString(),
      anonymousName: randomName,
      replyCount: 0,
    }
    setPosts((prev) => [newPost, ...prev])
    setView('feed')
  }

  const handleVentFilterClick = () => {
    if (ventBarrierPassed && ventPostsSeen < VENT_LIMIT) {
      setFilter('vent')
    } else {
      // Need to go through barrier
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
      // Reset barrier after limit
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
        <NewPostForm
          onSubmit={handleNewPost}
          onCancel={() => setView('feed')}
        />
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
        <button
          className={`filter-btn ${filter === 'all' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'milestone' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('milestone')}
        >
          🏆 Milestones
        </button>
        <button
          className={`filter-btn ${filter === 'happy' ? 'filter-btn--active' : ''}`}
          onClick={() => setFilter('happy')}
        >
          ☀️ Good Things
        </button>
        <button
          className={`filter-btn ${filter === 'vent' ? 'filter-btn--active' : ''}`}
          onClick={handleVentFilterClick}
        >
          💬 Vent Posts
        </button>
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

      <div className="social-tab__feed">
        {filter !== 'vent' &&
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={CURRENT_USER_ID}
              onReply={handleReply}
            />
          ))}

        {filter === 'vent' && ventBarrierPassed &&
          ventPosts.slice(0, VENT_LIMIT).map((post, idx) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={CURRENT_USER_ID}
              onReply={(postId, content) => {
                handleReply(postId, content)
                if (idx === 0) handleVentPostView()
              }}
            />
          ))}

        {filter === 'vent' && !ventBarrierPassed && (
          <div className="empty-state">
            <p>Complete the check-in to view vent posts.</p>
            <button className="btn btn--primary" onClick={handleVentFilterClick}>
              Begin check-in
            </button>
          </div>
        )}

        {filter !== 'vent' && filteredPosts.length === 0 && (
          <div className="empty-state">
            <p>No posts here yet. Be the first to share.</p>
          </div>
        )}
      </div>
    </div>
  )
}
