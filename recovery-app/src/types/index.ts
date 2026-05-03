// ─── Auth / Profile ───────────────────────────────────────────────────────────

export type TrackingMode = 'daily_checkin' | 'auto_increment'

export interface AppUser {
  id: string
  username: string
  trackingMode: TrackingMode
  recoveryStartDate: string   // YYYY-MM-DD
  favoriteColor: string       // hex e.g. '#4f8a6e'
}

// ─── Posts & Replies ──────────────────────────────────────────────────────────

export type PostType = 'milestone' | 'happy' | 'vent'

export type PostFilter = 'all' | 'milestone' | 'happy' | 'vent'

export interface Post {
  id: string
  userId: string | null       // null for seed posts
  type: PostType
  content: string
  anonymousName: string
  createdAt: string           // ISO timestamp
  replyCount?: number         // only visible to post owner
}

export interface Reply {
  id: string
  postId: string
  senderId: string
  recipientId: string
  content: string
  createdAt: string
  senderName: string          // anonymous name of sender
}

// ─── Check-ins ────────────────────────────────────────────────────────────────

export type DayStatus = 'clean' | 'relapse' | null

export interface CheckIn {
  id: string
  userId: string
  date: string                // YYYY-MM-DD
  status: 'clean' | 'relapse'
  note: string | null
  relapseReason: string | null
  aiTags?: string[]
  aiProcessed?: boolean
}

// ─── Relapse Patterns ─────────────────────────────────────────────────────────

export interface RelapsePattern {
  id: string
  patternType: string
  description: string
  frequency: number
  tags: string[]
  lastSeen: string | null
  side: 'regression' | 'protective'
}

// ─── Happy Items ──────────────────────────────────────────────────────────────

export interface HappyItem {
  id: string
  userId: string
  title: string
  description: string | null
  energyLevel: number         // 1–5
  prepLevel: number           // 1–5
  createdAt: string
}

// ─── Relapse Word Flags ───────────────────────────────────────────────────────

export interface RelapseWordFlag {
  id: string
  userId: string
  word: string
  frequency: number
  lastSeen: string | null     // YYYY-MM-DD
}

// ─── Relapse Prediction ───────────────────────────────────────────────────────

export type DistributionMode = 'unimodal' | 'bimodal'

export interface IntervalCluster {
  centroid: number                    // mean interval in days for this cluster
  members: number[]                   // intervals assigned to this cluster
  weight: number                      // proportion of total intervals (0.0–1.0)
  predictedDate: string | null        // YYYY-MM-DD prediction from this cluster
  daysUntilPredicted: number | null
}

export interface NumericalPrediction {
  distributionMode: DistributionMode
  // Unimodal: single prediction
  predictedDate: string | null        // YYYY-MM-DD, null if insufficient data
  daysUntilPredicted: number | null
  averageInterval: number             // days (weighted mean across all intervals)
  intervalHistory: number[]           // days between each relapse
  confidence: 'low' | 'medium' | 'high'
  // Bimodal: two cluster predictions (populated when distributionMode = 'bimodal')
  clusters: IntervalCluster[]         // always length 2 when bimodal, empty when unimodal
  // The nearest upcoming predicted date across all active clusters
  nearestPredictedDate: string | null
  nearestDaysUntil: number | null
}

export interface WordRiskSignal {
  word: string
  riskScore: number                   // 0.0–1.0
  recentOccurrences: number
  historicalFrequency: number
}

export interface RelapseRiskAssessment {
  overallRisk: 'none' | 'low' | 'medium' | 'high'
  numerical: NumericalPrediction
  wordSignals: WordRiskSignal[]
  triggeringWords: string[]           // words found in recent notes that match flags
  suggestedAction: NudgeAction | null
}

// ─── Nudge System ─────────────────────────────────────────────────────────────

export type NudgeType = 'milestone_prompt' | 'happy_item_suggestion' | 'none'

export interface NudgeAction {
  type: NudgeType
  message: string
  happyItem?: HappyItem               // present when type = 'happy_item_suggestion'
  askIfDoneRecently?: boolean          // true when energy_level >= 4
}

// ─── Vent Barrier ─────────────────────────────────────────────────────────────

export type BarrierStep = 'intro' | 'check1' | 'check2' | 'check3' | 'ready'
export type BarrierAnswer = 'yes' | 'okay' | 'no' | ''

export interface BarrierState {
  step: BarrierStep
  answers: {
    check1: BarrierAnswer             // emotional state
    check2: BarrierAnswer             // support availability
    check3: BarrierAnswer             // reading intention
  }
  ventPostsViewed: number             // resets to 0 after barrier; increments per vent post shown
  barrierPassed: boolean
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string                        // YYYY-MM-DD
  status: DayStatus
  isToday: boolean
  isFuture: boolean
  isBeforeStartDate: boolean
}
