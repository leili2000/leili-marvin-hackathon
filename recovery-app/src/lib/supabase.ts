import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing — running in mock mode')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

// ─── Database types (mirrors schema.sql) ─────────────────────────
export type DbProfile = {
  id: string
  username: string
  tracking_mode: 'daily_checkin' | 'auto_increment'
  recovery_start_date: string
  created_at: string
}

export type DbPost = {
  id: string
  user_id: string
  type: 'milestone' | 'happy' | 'vent'
  content: string
  anonymous_name: string
  created_at: string
}

export type DbReply = {
  id: string
  post_id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
}

export type DbCheckIn = {
  id: string
  user_id: string
  date: string
  status: 'clean' | 'relapse'
  note: string | null
  relapse_reason: string | null
  created_at: string
}

export type DbRelapsePattern = {
  id: string
  user_id: string
  pattern_type: string
  description: string
  frequency: number
  created_at: string
}
