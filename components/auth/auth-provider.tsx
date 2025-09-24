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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
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