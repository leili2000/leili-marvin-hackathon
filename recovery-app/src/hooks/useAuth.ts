import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { AppUser } from '../types/index'
import type { Session } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: AppUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    username: string,
    recoveryStartDate: string,
    favoriteColor: string
  ) => Promise<void>
  signOut: () => Promise<void>
}

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    username: data.username,
    trackingMode: data.tracking_mode,
    recoveryStartDate: data.recovery_start_date,
    favoriteColor: data.favorite_color,
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Timeout fallback — if getSession hangs for more than 5 seconds, stop loading
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false)
      }
    }, 5000)

    // Restore session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (mounted) setUser(profile)
      }
      if (mounted) setLoading(false)
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (!mounted) return
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (mounted) setUser(profile)
        } else {
          if (mounted) setUser(null)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInError) {
      setError(signInError.message)
    }
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      recoveryStartDate: string,
      favoriteColor: string
    ) => {
      setError(null)

      const { data: authData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              recovery_start_date: recoveryStartDate,
              favorite_color: favoriteColor,
            },
          },
        })

      if (signUpError) {
        console.error('Supabase signUp error:', signUpError)
        setError(signUpError.message)
        return
      }

      // Explicitly insert profile row for reliability (the trigger may also fire)
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: authData.user.id,
              username,
              recovery_start_date: recoveryStartDate,
              favorite_color: favoriteColor,
              tracking_mode: 'auto_increment',
            },
            { onConflict: 'id' }
          )

        if (profileError) {
          setError(profileError.message)
        }
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
    }
  }, [])

  return { user, loading, error, signIn, signUp, signOut }
}
