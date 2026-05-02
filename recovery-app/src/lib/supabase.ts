import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          tracking_mode: 'daily_checkin' | 'auto_increment'
          created_at: string
          recovery_start_date: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          type: 'milestone' | 'happy' | 'vent'
          content: string
          created_at: string
          anonymous_name: string
        }
      }
      replies: {
        Row: {
          id: string
          post_id: string
          sender_id: string
          recipient_id: string
          content: string
          created_at: string
        }
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          date: string
          status: 'clean' | 'relapse'
          note: string | null
          relapse_reason: string | null
          created_at: string
        }
      }
      relapse_patterns: {
        Row: {
          id: string
          user_id: string
          pattern_type: string
          description: string
          frequency: number
          created_at: string
        }
      }
    }
  }
}
