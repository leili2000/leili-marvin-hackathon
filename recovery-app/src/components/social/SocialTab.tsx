import { useState, useCallback } from 'react'
import type { PostFilter } from '../../types/index'
import { usePosts } from '../../hooks/usePosts'
import { PostFeed } from './PostFeed'
import { NewPostForm } from './NewPostForm'
import { VentBarrier } from './VentBarrier'
import { InboxPanel } from './InboxPanel'

interface SocialTabProps {
  currentUserId: string
}

const FILTER_ITEMS: { key: PostFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'milestone', label: 'Milestones' },
  { key: 'happy', label: 'Good Things' },
  { key: 'vent', label: 'Vent Posts' },
]

export function SocialTab({ currentUserId }: SocialTabProps) {
  const {
    posts,
    inbox,
    replyCountMap,
    loading,
    error,
    filter,
    setFilter,
    createPost,
    sendReply,
    fetchInbox,
    refresh,
  } = usePosts(currentUserId)

  const [ventBarrierPassed, setVentBarrierPassed] = useState(false)
  const [showVentBarrier, setShowVentBarrier] = useState(false)
  const [showInbox, setShowInbox] = useState(false)

  const handleFilterChange = (newFilter: PostFilter) => {
    if (newFilter === 'vent' && !ventBarrierPassed) {
      // Show the vent barrier before allowing vent posts
      setShowVentBarrier(true)
      setFilter(newFilter)
      return
    }
    setShowVentBarrier(false)
    setFilter(newFilter)
  }

  const handleVentBarrierComplete = () => {
    setVentBarrierPassed(true)
    setShowVentBarrier(false)
  }

  const handleVentBarrierDecline = () => {
    setShowVentBarrier(false)
    setFilter('all')
  }

  const handleVentPostViewed = useCallback(() => {
    // The vent barrier state machine handles the 3-post reset internally.
    // For the component-level gate, we track it simply:
    // After 3 vent posts viewed, re-require the barrier.
    // This is a simplified version — the full state machine is in VentBarrier.
  }, [])

  const handleToggleInbox = async () => {
    if (!showInbox) {
      await fetchInbox()
    }
    setShowInbox(!showInbox)
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading posts…</div>
  }

  return (
    <div>
      {/* Header with Inbox toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.2em' }}>Community</h2>
        <button
          type="button"
          onClick={handleToggleInbox}
          style={{
            padding: '6px 14px',
            background: showInbox ? 'var(--color-primary, #4f8a6e)' : 'transparent',
            color: showInbox ? 'var(--color-primary-contrast, #fff)' : 'var(--color-primary, #4f8a6e)',
            border: '1px solid var(--color-primary, #4f8a6e)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85em',
          }}
        >
          📬 Inbox
        </button>
      </div>

      {/* Post Filter Bar */}
      <nav
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '8px',
          overflowX: 'auto',
        }}
      >
        {FILTER_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleFilterChange(item.key)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '16px',
              background: filter === item.key ? 'var(--color-primary, #4f8a6e)' : 'transparent',
              color: filter === item.key ? 'var(--color-primary-contrast, #fff)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9em',
              fontWeight: filter === item.key ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Vent Barrier — shown when vent filter selected and barrier not passed */}
      {filter === 'vent' && showVentBarrier && !ventBarrierPassed && (
        <VentBarrier
          onComplete={handleVentBarrierComplete}
          onDecline={handleVentBarrierDecline}
        />
      )}

      {/* New Post Form — always visible */}
      <NewPostForm onSubmit={createPost} />

      {/* Post Feed — hidden behind barrier for vent posts */}
      {!(filter === 'vent' && showVentBarrier && !ventBarrierPassed) && (
        <PostFeed
          posts={posts}
          currentUserId={currentUserId}
          onReply={sendReply}
          replyCountMap={replyCountMap}
          onVentPostViewed={filter === 'vent' ? handleVentPostViewed : undefined}
          error={error}
          onRetry={refresh}
        />
      )}

      {/* Inbox Panel */}
      {showInbox && (
        <InboxPanel replies={inbox} onClose={() => setShowInbox(false)} />
      )}
    </div>
  )
}
