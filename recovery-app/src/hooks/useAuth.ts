import { useState, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User as AppUser, TrackingMode } from '../types'

export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: AppUser; session: Session }

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile(session.user, session)
      } else {
        setAuthState({ status: 'unauthenticated' })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          loadProfile(session.user, session)
        } else {
          setAuthState({ status: 'unauthenticated' })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (user: User, session: Session) => {
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    // Profile missing — create it on the fly (handles edge cases after schema resets)
    if (!profile) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'Anonymous',
          tracking_mode: 'auto_increment',
          recovery_start_date: user.user_metadata?.recovery_start_date ?? new Date().toISOString().split('T')[0],
        })
        .select()
        .single()
      profile = created
    }

    if (profile) {
      setAuthState({
        status: 'authenticated',
        session,
        user: {
          id: profile.id,
          username: profile.username,
          trackingMode: profile.tracking_mode as TrackingMode,
          recoveryStartDate: profile.recovery_start_date,
        },
      })
    } else {
      setAuthState({ status: 'unauthenticated' })
    }
  }

  const signUp = async (
    email: string,
    password: string,
    username: string,
    recoveryStartDate: string
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (!data.user) throw new Error('Sign up failed')

    // Create profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username,
      tracking_mode: 'auto_increment',
      recovery_start_date: recoveryStartDate,
    })
    if (profileError) throw profileError
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateTrackingMode = async (userId: string, mode: TrackingMode) => {
    const { error } = await supabase
      .from('profiles')
      .update({ tracking_mode: mode })
      .eq('id', userId)
    if (error) throw error

    // Optimistically update local state
    setAuthState((prev) => {
      if (prev.status !== 'authenticated') return prev
      return { ...prev, user: { ...prev.user, trackingMode: mode } }
    })
  }

  return { authState, signUp, signIn, signOut, updateTrackingMode }
}
