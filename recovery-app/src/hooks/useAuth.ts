import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { AppUser } from '../types/index'

const SESSION_KEY = 'recovery_app_user_id'

interface UseAuthReturn {
  user: AppUser | null
  loading: boolean
  error: string | null
  signIn: (username: string, password: string) => Promise<void>
  signUp: (
    username: string,
    password: string,
    recoveryStartDate: string,
    favoriteColor: string
  ) => Promise<void>
  signOut: () => Promise<void>
}

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, tracking_mode, recovery_start_date, favorite_color')
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

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem(SESSION_KEY)
    if (!savedId) {
      setLoading(false)
      return
    }

    fetchProfile(savedId).then((profile) => {
      if (profile) {
        setUser(profile)
      } else {
        localStorage.removeItem(SESSION_KEY)
      }
      setLoading(false)
    }).catch(() => {
      localStorage.removeItem(SESSION_KEY)
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    setError(null)

    const { data, error: rpcError } = await supabase.rpc('signin', {
      p_username: username,
      p_password: password,
    })

    if (rpcError) {
      setError('Something went wrong. Please try again.')
      return
    }

    if (!data) {
      setError('Invalid username or password')
      return
    }

    const userId = data as string
    const profile = await fetchProfile(userId)

    if (!profile) {
      setError('Could not load profile')
      return
    }

    localStorage.setItem(SESSION_KEY, userId)
    setUser(profile)
  }, [])

  const signUp = useCallback(
    async (
      username: string,
      password: string,
      recoveryStartDate: string,
      favoriteColor: string
    ) => {
      setError(null)

      console.log('signUp called with:', { username, recoveryStartDate, favoriteColor })

      const { data, error: rpcError } = await supabase.rpc('signup', {
        p_username: username,
        p_password: password,
        p_recovery_start_date: recoveryStartDate,
        p_favorite_color: favoriteColor,
      })

      console.log('signUp RPC result:', { data, error: rpcError })

      if (rpcError) {
        if (rpcError.message.includes('duplicate') || rpcError.message.includes('unique')) {
          setError('Username already taken')
        } else {
          setError(rpcError.message)
        }
        return
      }

      if (!data) {
        setError('Signup failed — no user ID returned')
        return
      }

      const userId = data as string
      console.log('signUp userId:', userId)
      const profile = await fetchProfile(userId)
      console.log('signUp profile:', profile)

      if (!profile) {
        setError('Account created but could not load profile. Try signing in.')
        return
      }

      localStorage.setItem(SESSION_KEY, userId)
      setUser(profile)
    },
    []
  )

  const signOut = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setError(null)
  }, [])

  return { user, loading, error, signIn, signUp, signOut }
}
