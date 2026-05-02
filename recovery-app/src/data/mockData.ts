import type { Post, Reply, CheckIn, User, RelapsePattern } from '../types'

export const mockUser: User = {
  id: 'user-001',
  username: 'Alex M.',
  trackingMode: 'auto_increment',
  recoveryStartDate: '2024-11-15',
}

export const mockPosts: Post[] = [
  {
    id: 'post-001',
    userId: 'user-002',
    type: 'milestone',
    content: '30 days clean today. I honestly didn\'t think I\'d make it this far. One day at a time really does work.',
    createdAt: '2026-05-01T10:23:00Z',
    anonymousName: 'Sunrise Walker',
    replyCount: 4,
  },
  {
    id: 'post-002',
    userId: 'user-003',
    type: 'happy',
    content: 'Made breakfast for my kids this morning without feeling like a zombie. Small thing but it meant everything.',
    createdAt: '2026-05-01T08:45:00Z',
    anonymousName: 'River Stone',
    replyCount: 7,
  },
  {
    id: 'post-003',
    userId: 'user-004',
    type: 'milestone',
    content: '6 months. Half a year. I cried in the shower this morning — happy tears for once.',
    createdAt: '2026-04-30T19:12:00Z',
    anonymousName: 'Quiet Harbor',
    replyCount: 12,
  },
  {
    id: 'post-004',
    userId: 'user-005',
    type: 'happy',
    content: 'My sponsor called just to check in, not because I reached out. Felt seen for the first time in a long time.',
    createdAt: '2026-04-30T14:30:00Z',
    anonymousName: 'Morning Tide',
    replyCount: 3,
  },
  {
    id: 'post-005',
    userId: 'user-006',
    type: 'vent',
    content: 'Had a really hard week. Lost my job and the urge to use was overwhelming. I didn\'t, but it was close. I\'m scared of how close it was.',
    createdAt: '2026-04-29T22:15:00Z',
    anonymousName: 'Still Standing',
    replyCount: 9,
  },
  {
    id: 'post-006',
    userId: 'user-007',
    type: 'vent',
    content: 'Relapsed after 47 days. I\'m not giving up but I needed to say it out loud somewhere safe. Starting again tomorrow.',
    createdAt: '2026-04-28T20:00:00Z',
    anonymousName: 'New Chapter',
    replyCount: 15,
  },
  {
    id: 'post-007',
    userId: 'user-008',
    type: 'vent',
    content: 'Family dinner was a trigger I didn\'t see coming. The comments, the stress. I white-knuckled through it. Exhausted.',
    createdAt: '2026-04-27T23:45:00Z',
    anonymousName: 'Steady Breath',
    replyCount: 6,
  },
  {
    id: 'post-008',
    userId: 'user-009',
    type: 'milestone',
    content: '1 year. I remember thinking I\'d never see this day. To anyone just starting — keep going.',
    createdAt: '2026-04-26T12:00:00Z',
    anonymousName: 'Open Road',
    replyCount: 28,
  },
  {
    id: 'post-009',
    userId: 'user-010',
    type: 'happy',
    content: 'Went for a run today. First time in years I did something just because it felt good, not to escape.',
    createdAt: '2026-04-25T07:30:00Z',
    anonymousName: 'Clear Sky',
    replyCount: 5,
  },
]

export const mockReplies: Reply[] = [
  {
    id: 'reply-001',
    postId: 'post-001',
    senderId: 'user-003',
    recipientId: 'user-001',
    content: 'This made my morning. You\'re doing amazing.',
    createdAt: '2026-05-01T11:00:00Z',
    senderName: 'River Stone',
  },
  {
    id: 'reply-002',
    postId: 'post-003',
    senderId: 'user-004',
    recipientId: 'user-001',
    content: 'Six months is huge. You should be so proud.',
    createdAt: '2026-04-30T20:00:00Z',
    senderName: 'Morning Tide',
  },
  {
    id: 'reply-003',
    postId: 'post-005',
    senderId: 'user-002',
    recipientId: 'user-001',
    content: 'The fact that you didn\'t is everything. That strength is real.',
    createdAt: '2026-04-29T23:00:00Z',
    senderName: 'Sunrise Walker',
  },
]

// Generate calendar data for the past ~6 months
function generateCalendarData(): CheckIn[] {
  const checkins: CheckIn[] = []
  const start = new Date('2024-11-15')
  const today = new Date('2026-05-02')

  // Known relapse dates for realistic data
  const relapseDates = new Set([
    '2024-12-24', '2025-01-01', '2025-02-14',
    '2025-04-05', '2025-06-20', '2025-09-03',
    '2025-11-28', '2026-01-15', '2026-03-08',
  ])

  const relapseReasons: Record<string, string> = {
    '2024-12-24': 'Holiday stress and family conflict. Everyone was drinking and I felt invisible.',
    '2025-01-01': 'New Year\'s Eve party. Peer pressure and loneliness hit at the same time.',
    '2025-02-14': 'Valentine\'s Day alone. Isolation and old memories.',
    '2025-04-05': 'Work deadline stress. Felt like I couldn\'t cope any other way.',
    '2025-06-20': 'Ran into an old using friend. The nostalgia was overwhelming.',
    '2025-09-03': 'Anniversary of a loss. Grief I hadn\'t processed.',
    '2025-11-28': 'Thanksgiving family tension. Felt like I was back in old patterns.',
    '2026-01-15': 'Insomnia for a week straight. Desperation.',
    '2026-03-08': 'Argument with partner. Felt like everything was falling apart.',
  }

  let id = 1
  const current = new Date(start)
  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0]
    const isRelapse = relapseDates.has(dateStr)

    checkins.push({
      id: `checkin-${id++}`,
      userId: 'user-001',
      date: dateStr,
      status: isRelapse ? 'relapse' : 'clean',
      note: isRelapse ? null : null,
      relapseReason: isRelapse ? (relapseReasons[dateStr] || null) : null,
    })

    current.setDate(current.getDate() + 1)
  }

  return checkins
}

export const mockCheckIns: CheckIn[] = generateCalendarData()

export const mockRelapsePatterns: RelapsePattern[] = [
  {
    id: 'pattern-001',
    patternType: 'Social / Isolation',
    description: 'Relapses tend to cluster around social events (holidays, gatherings) and periods of isolation. The contrast between expected connection and actual loneliness appears to be a key trigger.',
    frequency: 4,
  },
  {
    id: 'pattern-002',
    patternType: 'Stress & Overwhelm',
    description: 'Work pressure, deadlines, and feeling out of control precede several relapses. Coping strategies for acute stress may need reinforcement.',
    frequency: 3,
  },
  {
    id: 'pattern-003',
    patternType: 'Grief & Loss',
    description: 'Anniversaries and unprocessed grief appear as triggers. Emotional pain without an outlet increases vulnerability.',
    frequency: 2,
  },
  {
    id: 'pattern-004',
    patternType: 'Environmental Cues',
    description: 'Encounters with people or places associated with past use triggered one relapse. Environmental exposure remains a risk factor.',
    frequency: 1,
  },
]

export const anonymousNames = [
  'Sunrise Walker', 'River Stone', 'Quiet Harbor', 'Morning Tide',
  'Still Standing', 'New Chapter', 'Steady Breath', 'Open Road',
  'Clear Sky', 'Gentle Current', 'Warm Light', 'Steady Ground',
  'Rising Tide', 'Soft Rain', 'New Dawn', 'Calm Waters',
]
