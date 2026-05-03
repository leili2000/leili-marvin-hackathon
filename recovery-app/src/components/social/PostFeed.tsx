import type { Post } from '../../types/index'
import { PostCard } from './PostCard'

interface PostFeedProps {
  posts: Post[]
  currentUserId: string
  onReply: (postId: string, recipientId: string, content: string) => Promise<boolean>
  replyCountMap: Map<string, number>
  onVentPostViewed?: () => void
  error?: string | null
  onRetry?: () => void
}

export function PostFeed({
  posts,
  currentUserId,
  onReply,
  replyCountMap,
  onVentPostViewed,
  error,
  onRetry,
}: PostFeedProps) {
  if (error) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '32px 16px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <p style={{ margin: '0 0 12px', color: '#e74c3c' }}>Couldn't load posts</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              padding: '8px 18px',
              background: 'var(--color-primary, #4f8a6e)',
              color: 'var(--color-primary-contrast, #fff)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9em',
            }}
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '32px 0', fontSize: '0.9em' }}>
        No posts yet — be the first to share.
      </p>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          isOwn={post.userId === currentUserId}
          onReply={onReply}
          replyCount={replyCountMap.get(post.id)}
          onVentPostViewed={onVentPostViewed}
        />
      ))}
    </div>
  )
}
