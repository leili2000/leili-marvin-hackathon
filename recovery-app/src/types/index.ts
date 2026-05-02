export type PostType = 'milestone' | 'happy' | 'vent'
export type TrackingMode = 'daily_checkin' | 'auto_increment'
export type DayStatus = 'clean' | 'relapse' | null

export interface User {
  id: string
  username: string
  trackingMode: TrackingMode
  recoveryStartDate: string
  themeColor: string
}

export interface Post {
  id: string
  userId: string
  type: PostType
  content: string
  createdAt: string
  anonymousName: string
  replyCount?: number
}

export interface Reply {
  id: string
  postId: string
  senderId: string
  recipientId: string
  content: string
  createdAt: string
  senderName: string
}

export interface CheckIn {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  status: 'clean' | 'relapse'
  note: string | null
  relapseReason: string | null
}

export interface RelapsePattern {
  id: string
  patternType: string
  description: string
  frequency: number
  tags?: string[]
  lastSeen?: string | null
  side?: 'regression' | 'protective'
}

export interface CalendarDay {
  date: string
  status: DayStatus
}
