'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

async function checkAndKickExpiredUser(userId: string, supabase: ReturnType<typeof createClient>): Promise<boolean> {
  try {
    const { data: membership, error } = await supabase
      .from('user_memberships')
      .select('id, status, expiry_date')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Membership check error:', error)
      return false
    }

    if (membership) {
      const expiryDate = new Date(membership.expiry_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      expiryDate.setHours(0, 0, 0, 0)

      if (expiryDate < today) {
        console.log(`KICKING OUT: User ${userId} membership expired on ${membership.expiry_date}`)
        await supabase.auth.signOut()
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('membership_expired', 'true')
        }
        
        return true
      }
    } else {
      console.log(`KICKING OUT: User ${userId} has no active membership`)
      await supabase.auth.signOut()
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('membership_expired', 'true')
      }
      
      return true
    }
  } catch (checkError) {
    console.error('Membership validation error:', checkError)
  }
  
  return false
}

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
  const router = useRouter()
  const [leagues, setLeagues] = useState<UserLeagueAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    async function fetchLeagues() {
      if (!user) {
        setLeagues([])
        setLoading(false)
        return
      }

      // Prevent multiple checks
      if (hasCheckedRef.current) {
        hasCheckedRef.current = false
        return
      }
      hasCheckedRef.current = true

      try {
        setLoading(true)
        
        // Check membership expiry BEFORE fetching leagues
        const isExpired = await checkAndKickExpiredUser(user.id, supabase)
        
        if (isExpired) {
          router.push('/auth/login?expired=true')
          setLeagues([])
          setLoading(false)
          return
        }
        
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
  }, [user, supabase, router])

  return {
    leagues,
    loading,
    error
  }
}