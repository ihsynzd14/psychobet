'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  sessionConflict: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  clearSessionConflict: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionConflict, setSessionConflict] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check for session conflict on load
    const wasSessionConflict = localStorage.getItem('session_conflict')
    if (wasSessionConflict === 'true') {
      setSessionConflict(true)
      localStorage.removeItem('session_conflict')
    }

    // Check if user was kicked out
    const wasKickedOut = localStorage.getItem('session_kicked')
    if (wasKickedOut === 'true') {
      setSessionConflict(true) // Use same conflict state
      localStorage.removeItem('session_kicked')
    }

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle session conflict detection
        if (event === 'SIGNED_OUT') {
          const wasConflict = localStorage.getItem('session_conflict')
          if (wasConflict === 'true') {
            setSessionConflict(true)
            localStorage.removeItem('session_conflict')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)

      // BRUTAL SESSION TERMINATION - BEFORE AUTHENTICATION
      try {
        const serviceClient = await import('@/lib/supabase/service-role').then(m => m.createServiceRoleClient())

        if (serviceClient) {
          // Get user ID for this email (getUserByEmail was removed in newer versions)
          const { data: { users } } = await serviceClient.auth.admin.listUsers()
          const user = users?.find((u: any) => u.email === email)

          if (user) {
            console.log(`BRUTAL TERMINATION for user: ${user.id}`)

            // STEP 1: INSTANTLY MARK ALL SESSIONS AS INACTIVE
            const { error: updateError } = await serviceClient
              .from('user_sessions')
              .update({
                is_active: false,
                last_active: new Date().toISOString(),
                invalidated_by: `brutal_termination_${Date.now()}`
              })
              .eq('user_id', user.id)

            if (!updateError) {
              console.log(`BRUTAL: All sessions marked inactive for user ${user.id}`)

              // STEP 2: FIND AND IMMEDIATELY TERMINATE ALL ACTIVE SESSIONS
              const { data: activeSessions } = await serviceClient
                .from('user_sessions')
                .select('session_id')
                .eq('user_id', user.id)

              if (activeSessions && activeSessions.length > 0) {
                console.log(`BRUTAL: Terminating ${activeSessions.length} active sessions`)

                for (const session of activeSessions) {
                  try {
                    // FORCE SIGN OUT FROM SUPABASE AUTH
                    await serviceClient.auth.admin.signOut(session.session_id)
                    console.log(`BRUTAL: Terminated session ${session.session_id.substring(0, 20)}...`)
                  } catch (e) {
                    // Continue even if one fails
                  }
                }

                console.log(`BRUTAL: All previous sessions terminated for user ${user.id}`)
              }

              // STEP 3: WAIT FOR TERMINATION TO PROPAGATE
              await new Promise(resolve => setTimeout(resolve, 1200))
              console.log(`BRUTAL: Termination delay completed, ready for new session`)
            }
          }
        }
      } catch (terminationError) {
        console.warn('BRUTAL termination failed:', terminationError)
        // Continue anyway - we'll still try to login
      }

      // STEP 4: NOW CREATE NEW SESSION
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Auth provider sign in error:', error)
        return { error }
      }

      console.log(`BRUTAL: New session created for ${email} - previous users KICKED OUT`)
      return { error: null }
    } catch (error) {
      console.error('Unexpected auth provider error:', error)
      return { error: error instanceof Error ? error : new Error('Unknown error') }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const clearSessionConflict = () => {
    setSessionConflict(false)
  }

  const value = {
    user,
    session,
    loading,
    sessionConflict,
    signInWithEmail,
    signOut,
    clearSessionConflict,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}