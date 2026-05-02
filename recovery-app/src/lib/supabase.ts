import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          tracking_mode: 'daily_checkin' | 'auto_increment'
          recovery_start_date: string
          created_at: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          type: 'milestone' | 'happy' | 'vent'
          content: string
          anonymous_name: string
          created_at: string
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
          ai_tags: string[]
          ai_processed: boolean
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
          tags: string[]
          last_seen: string | null
          created_at: string
        }
      }
    }
    Views: {
      replies_with_sender: {
        Row: {
          id: string
          post_id: string
          sender_id: string
          recipient_id: string
          content: string
          created_at: string
          sender_name: string
        }
      }
    }
  }
}
