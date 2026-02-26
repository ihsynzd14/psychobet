'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/client'

interface UserMembership {
  id: string
  user_id: string
  status: 'active' | 'expired' | 'suspended' | 'cancelled'
  start_date: string
  expiry_date: string
  created_at: string
  updated_at: string
}

interface UserMembershipData {
  membership: UserMembership | null
  loading: boolean
  error: string | null
  isExpired: boolean
}

export function useUserMembership(): UserMembershipData {
  const { user } = useAuth()
  const [membership, setMembership] = useState<UserMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchMembership() {
      if (!user) {
        setMembership(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch the user's active membership
        const { data, error } = await supabase
          .from('user_memberships')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error
        }

        setMembership(data || null)
        setError(null)
      } catch (err) {
        console.error('Error fetching user membership:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch membership')
        setMembership(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMembership()
  }, [user, supabase])

  const isExpired = !loading && (
    !membership ||
    (membership.expiry_date ? new Date(membership.expiry_date).getTime() < new Date().getTime() : true)
  )

  return {
    membership,
    loading,
    error,
    isExpired
  }
}
