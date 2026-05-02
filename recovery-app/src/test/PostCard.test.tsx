import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PostCard } from '../components/social/PostCard'
import type { Post } from '../types'

const milestonePost: Post = {
  id: 'p1',
  userId: 'user-002',
  type: 'milestone',
  content: '30 days clean today.',
  createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  anonymousName: 'Sunrise Walker',
  replyCount: 4,
}

const ventPost: Post = {
  id: 'p2',
  userId: 'user-003',
  type: 'vent',
  content: 'Really hard week.',
  createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  anonymousName: 'Still Standing',
  replyCount: 2,
}

describe('PostCard', () => {
  it('renders post content', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    expect(screen.getByText('30 days clean today.')).toBeInTheDocument()
  })

  it('renders the anonymous name', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    expect(screen.getByText(/Sunrise Walker/)).toBeInTheDocument()
  })

  it('shows milestone badge for milestone posts', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    expect(screen.getByText(/Milestone/i)).toBeInTheDocument()
  })

  it('shows vent badge for vent posts', () => {
    render(<PostCard post={ventPost} currentUserId="user-001" onReply={vi.fn()} />)
    expect(screen.getByText(/Vent/i)).toBeInTheDocument()
  })

  it('shows reply count', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    expect(screen.getByText(/4.*repl/i)).toBeInTheDocument()
  })

  it('shows reply button for posts by other users', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    expect(screen.getByText('Reply privately')).toBeInTheDocument()
  })

  it('does not show reply button for own posts', () => {
    const ownPost = { ...milestonePost, userId: 'user-001' }
    render(<PostCard post={ownPost} currentUserId="user-001" onReply={vi.fn()} />)
    expect(screen.queryByText('Reply privately')).not.toBeInTheDocument()
  })

  it('shows reply box when reply button is clicked', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    fireEvent.click(screen.getByText('Reply privately'))
    expect(screen.getByPlaceholderText(/Write something supportive/i)).toBeInTheDocument()
  })

  it('shows privacy note in reply box', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    fireEvent.click(screen.getByText('Reply privately'))
    expect(screen.getByText(/no one else will see it/i)).toBeInTheDocument()
  })

  it('send button is disabled when reply is empty', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    fireEvent.click(screen.getByText('Reply privately'))
    const sendBtn = screen.getByText('Send reply')
    expect(sendBtn).toBeDisabled()
  })

  it('calls onReply with postId and content when sent', () => {
    const onReply = vi.fn()
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={onReply} />)
    fireEvent.click(screen.getByText('Reply privately'))
    fireEvent.change(screen.getByPlaceholderText(/Write something supportive/i), {
      target: { value: 'You got this!' },
    })
    fireEvent.click(screen.getByText('Send reply'))
    expect(onReply).toHaveBeenCalledWith('p1', 'You got this!')
  })

  it('shows sent confirmation after reply is sent', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    fireEvent.click(screen.getByText('Reply privately'))
    fireEvent.change(screen.getByPlaceholderText(/Write something supportive/i), {
      target: { value: 'Keep going!' },
    })
    fireEvent.click(screen.getByText('Send reply'))
    expect(screen.getByText(/Reply sent/i)).toBeInTheDocument()
  })

  it('hides reply box after sending', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    fireEvent.click(screen.getByText('Reply privately'))
    fireEvent.change(screen.getByPlaceholderText(/Write something supportive/i), {
      target: { value: 'Keep going!' },
    })
    fireEvent.click(screen.getByText('Send reply'))
    expect(screen.queryByPlaceholderText(/Write something supportive/i)).not.toBeInTheDocument()
  })

  it('cancel button hides the reply box', () => {
    render(<PostCard post={milestonePost} currentUserId="user-001" onReply={vi.fn()} />)
    fireEvent.click(screen.getByText('Reply privately'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByPlaceholderText(/Write something supportive/i)).not.toBeInTheDocument()
  })
})
