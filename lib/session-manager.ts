import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export interface SessionInfo {
  id: string
  user_id: string
  session_id: string
  device_info: any
  ip_address: string | null
  created_at: string
  last_active: string
  is_active: boolean
}

export class SessionManager {
  static async invalidatePreviousSessions(userId: string, currentSessionId: string): Promise<void> {
    const serviceClient = createServiceRoleClient()

    // If service role client is not available, skip session invalidation
    if (!serviceClient) {
      console.warn('Service role client not available. Skipping session invalidation.')
      return
    }

    try {
      // Get all active sessions for this user except current one
      const { data: sessions, error: fetchError } = await serviceClient
        .from('user_sessions')
        .select('session_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .neq('session_id', currentSessionId)

      if (fetchError) {
        console.error('Error fetching sessions:', fetchError)
        return
      }

      // Invalidate each session using Supabase admin API
      for (const session of sessions || []) {
        try {
          await serviceClient.auth.admin.signOut(session.session_id)
        } catch (signOutError) {
          console.error('Error signing out session:', signOutError)
          // Continue with other sessions even if one fails
        }
      }

      // Mark sessions as inactive in database
      const { error: updateError } = await serviceClient
        .from('user_sessions')
        .update({
          is_active: false,
          last_active: new Date().toISOString()
        })
        .eq('user_id', userId)
        .neq('session_id', currentSessionId)

      if (updateError) {
        console.error('Error updating sessions:', updateError)
      }
    } catch (error) {
      console.error('Error in invalidatePreviousSessions:', error)
    }
  }

  static async createSessionRecord(
    userId: string,
    sessionId: string,
    deviceInfo?: any,
    ipAddress?: string
  ): Promise<void> {
    const supabase = createClient()

    try {
      console.log('Creating session record for user:', userId, 'sessionId:', sessionId?.substring(0, 20) + '...')

      const { error } = await supabase.from('user_sessions').insert({
        user_id: userId,
        session_id: sessionId,
        device_info: deviceInfo || {},
        ip_address: ipAddress || null,
      })

      if (error) {
        console.error('Error creating session record:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
      } else {
        console.log('Session record created successfully for user:', userId)
      }
    } catch (error) {
      console.error('Error in createSessionRecord:', error)
    }
  }

  static async updateSessionActivity(sessionId: string, ipAddress?: string): Promise<void> {
    const supabase = createClient()

    try {
      const updateData: any = {
        last_active: new Date().toISOString()
      }

      if (ipAddress) {
        updateData.ip_address = ipAddress
      }

      const { error } = await supabase
        .from('user_sessions')
        .update(updateData)
        .eq('session_id', sessionId)

      if (error) {
        console.error('Error updating session activity:', error)
      }
    } catch (error) {
      console.error('Error in updateSessionActivity:', error)
    }
  }

  static async validateSession(sessionId: string): Promise<boolean> {
    const supabase = createClient()

    try {
      console.log('Validating session:', sessionId?.substring(0, 20) + '...')

      const { data, error } = await supabase
        .from('user_sessions')
        .select('is_active')
        .eq('session_id', sessionId)
        .single()

      // If no session found, it's invalid
      if (error && error.code === 'PGRST116') {
        console.log('Session not found in database:', sessionId?.substring(0, 20) + '...')
        return false
      }

      if (error) {
        console.error('Error validating session:', error)
        return false
      }

      const isValid = data?.is_active === true
      console.log('Session validation result:', isValid, 'for session:', sessionId?.substring(0, 20) + '...')
      return isValid
    } catch (error) {
      console.error('Error in validateSession:', error)
      return false
    }
  }

  static async getUserActiveSessions(userId: string): Promise<SessionInfo[]> {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user sessions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserActiveSessions:', error)
      return []
    }
  }

  static async terminateSession(sessionId: string): Promise<boolean> {
    const serviceClient = createServiceRoleClient()

    if (!serviceClient) {
      console.warn('Service role client not available. Cannot terminate session.')
      return false
    }

    try {
      // Invalidate session using Supabase admin API
      await serviceClient.auth.admin.signOut(sessionId)

      // Mark session as inactive in database
      const { error } = await serviceClient
        .from('user_sessions')
        .update({
          is_active: false,
          last_active: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      if (error) {
        console.error('Error terminating session:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in terminateSession:', error)
      return false
    }
  }

  static async terminateAllUserSessions(userId: string, exceptSessionId?: string): Promise<boolean> {
    const serviceClient = createServiceRoleClient()

    if (!serviceClient) {
      console.warn('Service role client not available. Cannot terminate user sessions.')
      return false
    }

    try {
      // Get all active sessions
      const { data: sessions, error: fetchError } = await serviceClient
        .from('user_sessions')
        .select('session_id')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (fetchError) {
        console.error('Error fetching user sessions:', fetchError)
        return false
      }

      // Invalidate each session
      for (const session of sessions || []) {
        if (session.session_id !== exceptSessionId) {
          try {
            await serviceClient.auth.admin.signOut(session.session_id)
          } catch (signOutError) {
            console.error('Error signing out session:', signOutError)
          }
        }
      }

      // Mark all sessions as inactive in database
      const { error: updateError } = await serviceClient
        .from('user_sessions')
        .update({
          is_active: false,
          last_active: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (exceptSessionId) {
        // Reactivate the current session
        await serviceClient
          .from('user_sessions')
          .update({
            is_active: true,
            last_active: new Date().toISOString()
          })
          .eq('session_id', exceptSessionId)
      }

      if (updateError) {
        console.error('Error updating user sessions:', updateError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in terminateAllUserSessions:', error)
      return false
    }
  }

  static async cleanupOldSessions(): Promise<void> {
    const serviceClient = createServiceRoleClient()

    if (!serviceClient) {
      console.warn('Service role client not available. Cannot cleanup old sessions.')
      return
    }

    try {
      // Clean up sessions older than 24 hours
      const { error } = await serviceClient
        .from('user_sessions')
        .delete()
        .lt('last_active', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (error) {
        console.error('Error cleaning up old sessions:', error)
      }
    } catch (error) {
      console.error('Error in cleanupOldSessions:', error)
    }
  }
}