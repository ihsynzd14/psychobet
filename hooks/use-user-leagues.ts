'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'

interface League {
  id: string
  name: string
  display_name: string
  country?: string
  logo_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface UserLeagueAccess {
  id: string
  user_id: string
  league_id: string
  membership_id?: string
  granted_at: string
  granted_by?: string
  league: League
}

interface UserLeaguesData {
  leagues: UserLeagueAccess[]
  loading: boolean
  error: string | null
}

export function useUserLeagues(): UserLeaguesData {
  const { user } = useAuth()
  const [leagues, setLeagues] = useState<UserLeagueAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLeagues() {
      if (!user) {
        setLeagues([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Fetch the user's league access with league details
        const { data, error } = await supabase
          .from('user_league_access')
          .select(`
            *,
            league:leagues(*)
          `)
          .eq('user_id', user.id)

        if (error) throw error

        setLeagues(data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching user leagues:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch leagues')
        setLeagues([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()
  }, [user, supabase])

  return {
    leagues,
    loading,
    error
  }
}