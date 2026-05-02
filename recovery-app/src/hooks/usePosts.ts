import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Post, Reply, PostType } from '../types'

const ANONYMOUS_NAMES = [
  'Sunrise Walker', 'River Stone', 'Quiet Harbor', 'Morning Tide',
  'Still Standing', 'New Chapter', 'Steady Breath', 'Open Road',
  'Clear Sky', 'Gentle Current', 'Warm Light', 'Steady Ground',
  'Rising Tide', 'Soft Rain', 'New Dawn', 'Calm Waters',
]

export function usePosts(currentUserId: string | null) {
  const [posts, setPosts] = useState<Post[]>([])
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Load posts ───────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    // Get reply counts per post
    const { data: replyCounts } = await supabase
      .from('replies')
      .select('post_id')

    const countMap = new Map<string, number>()
    replyCounts?.forEach((r) => {
      countMap.set(r.post_id, (countMap.get(r.post_id) ?? 0) + 1)
    })

    const mapped: Post[] = (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type as PostType,
      content: row.content,
      createdAt: row.created_at,
      anonymousName: row.anonymous_name,
      replyCount: countMap.get(row.id) ?? 0,
    }))

    setPosts(mapped)
    setLoading(false)
  }, [])

  // ─── Load inbox (replies sent to current user) ────────────────
  const fetchReplies = useCallback(async () => {
    if (!currentUserId) return

    const { data, error: fetchError } = await supabase
      .from('replies')
      .select(`
        id,
        post_id,
        sender_id,
        recipient_id,
        content,
        created_at,
        profiles!replies_sender_id_fkey (username)
      `)
      .eq('recipient_id', currentUserId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Failed to load replies:', fetchError.message)
      return
    }

    const mapped: Reply[] = (data ?? []).map((row) => ({
      id: row.id,
      postId: row.post_id,
      senderId: row.sender_id,
      recipientId: row.recipient_id,
      content: row.content,
      createdAt: row.created_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      senderName: (row.profiles as any)?.username ?? 'Anonymous',
    }))

    setReplies(mapped)
  }, [currentUserId])

  useEffect(() => {
    fetchPosts()
    fetchReplies()
  }, [fetchPosts, fetchReplies])

  // ─── Create post ──────────────────────────────────────────────
  const createPost = async (type: PostType, content: string): Promise<Post | null> => {
    if (!currentUserId) return null

    const randomName = ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)]

    const { data, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: currentUserId,
        type,
        content,
        anonymous_name: randomName,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create post:', insertError.message)
      return null
    }

    const newPost: Post = {
      id: data.id,
      userId: data.user_id,
      type: data.type as PostType,
      content: data.content,
      createdAt: data.created_at,
      anonymousName: data.anonymous_name,
      replyCount: 0,
    }

    setPosts((prev) => [newPost, ...prev])
    return newPost
  }

  // ─── Send reply ───────────────────────────────────────────────
  const sendReply = async (
    postId: string,
    recipientId: string,
    content: string
  ): Promise<boolean> => {
    if (!currentUserId) return false

    const { error: insertError } = await supabase.from('replies').insert({
      post_id: postId,
      sender_id: currentUserId,
      recipient_id: recipientId,
      content,
    })

    if (insertError) {
      console.error('Failed to send reply:', insertError.message)
      return false
    }

    // Bump reply count locally
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, replyCount: (p.replyCount ?? 0) + 1 } : p
      )
    )

    return true
  }

  return { posts, replies, loading, error, createPost, sendReply, refetch: fetchPosts }
}
