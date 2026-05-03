import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Post, Reply, PostType, PostFilter } from '../types/index'

// ─── Anonymous Name Generator ─────────────────────────────────────────────────

const ADJECTIVES = [
  'Sunrise', 'Quiet', 'Gentle', 'Bright', 'Calm',
  'Steady', 'Warm', 'Open', 'Silver', 'Golden',
  'Brave', 'Kind', 'Still', 'Soft', 'Clear',
  'Deep', 'Free', 'Bold', 'True', 'Wild',
]

const NOUNS = [
  'Walker', 'Harbor', 'Road', 'Stone', 'River',
  'Mountain', 'Meadow', 'Forest', 'Sky', 'Wave',
  'Breeze', 'Lantern', 'Garden', 'Sparrow', 'Compass',
  'Anchor', 'Horizon', 'Canyon', 'Ember', 'Willow',
]

export function generateAnonymousName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj} ${noun}`
}

// ─── DB row → camelCase mappers ───────────────────────────────────────────────

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    type: row.type as PostType,
    content: row.content as string,
    anonymousName: row.anonymous_name as string,
    createdAt: row.created_at as string,
  }
}

function mapReply(row: Record<string, unknown>): Reply {
  return {
    id: row.id as string,
    postId: row.post_id as string,
    senderId: row.sender_id as string,
    recipientId: row.recipient_id as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    senderName: (row.sender_name as string) ?? 'Anonymous',
  }
}

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UsePostsReturn {
  posts: Post[]
  inbox: Reply[]
  replyCountMap: Map<string, number>
  loading: boolean
  error: string | null
  filter: PostFilter
  setFilter: (filter: PostFilter) => void
  createPost: (type: PostType, content: string) => Promise<Post | null>
  sendReply: (postId: string, recipientId: string, content: string) => Promise<boolean>
  fetchInbox: () => Promise<void>
  refresh: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePosts(currentUserId: string): UsePostsReturn {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [inbox, setInbox] = useState<Reply[]>([])
  const [replyCountMap, setReplyCountMap] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<PostFilter>('all')

  // ── Fetch functions ───────────────────────────────────────────────────────

  const fetchPosts = useCallback(async (): Promise<Post[]> => {
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchError) throw new Error(fetchError.message)
    return (data ?? []).map(mapPost)
  }, [])

  const fetchReplyCounts = useCallback(async (uid: string): Promise<Map<string, number>> => {
    const { data, error: fetchError } = await supabase
      .from('replies')
      .select('post_id')
      .eq('recipient_id', uid)

    if (fetchError) throw new Error(fetchError.message)

    const countMap = new Map<string, number>()
    data?.forEach((r: Record<string, unknown>) => {
      const postId = r.post_id as string
      countMap.set(postId, (countMap.get(postId) ?? 0) + 1)
    })
    return countMap
  }, [])

  const fetchInboxReplies = useCallback(async (uid: string): Promise<Reply[]> => {
    const { data, error: fetchError } = await supabase
      .from('replies')
      .select('*')
      .eq('recipient_id', uid)
      .order('created_at', { ascending: false })

    if (fetchError) throw new Error(fetchError.message)
    return (data ?? []).map(mapReply)
  }, [])

  // ── Load all data ─────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [posts, counts] = await Promise.all([
        fetchPosts(),
        fetchReplyCounts(currentUserId),
      ])
      setAllPosts(posts)
      setReplyCountMap(counts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [currentUserId, fetchPosts, fetchReplyCounts])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // ── Client-side filtering ─────────────────────────────────────────────────

  const posts = filter === 'all'
    ? allPosts
    : allPosts.filter(p => p.type === filter)

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createPost = useCallback(
    async (type: PostType, content: string): Promise<Post | null> => {
      setError(null)

      const anonymousName = generateAnonymousName()

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: currentUserId,
          type,
          content,
          anonymous_name: anonymousName,
        })
        .select()
        .single()

      if (insertError || !data) {
        setError(insertError?.message ?? 'Failed to create post')
        return null
      }

      const newPost = mapPost(data as Record<string, unknown>)

      // Prepend the new post to the list (it's the most recent)
      setAllPosts(prev => [newPost, ...prev])

      return newPost
    },
    [currentUserId]
  )

  const sendReply = useCallback(
    async (postId: string, recipientId: string, content: string): Promise<boolean> => {
      setError(null)

      const senderName = generateAnonymousName()

      const { error: insertError } = await supabase
        .from('replies')
        .insert({
          post_id: postId,
          sender_id: currentUserId,
          recipient_id: recipientId,
          content,
          sender_name: senderName,
        })

      if (insertError) {
        setError("Couldn't send reply — try again")
        return false
      }

      // Refresh reply counts after sending
      try {
        const counts = await fetchReplyCounts(currentUserId)
        setReplyCountMap(counts)
      } catch {
        // Non-critical — counts will refresh on next load
      }

      return true
    },
    [currentUserId, fetchReplyCounts]
  )

  const fetchInbox = useCallback(async () => {
    try {
      const replies = await fetchInboxReplies(currentUserId)
      setInbox(replies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox')
    }
  }, [currentUserId, fetchInboxReplies])

  return {
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
    refresh: loadAll,
  }
}
