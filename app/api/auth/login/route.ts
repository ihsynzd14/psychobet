import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { SessionManager } from '@/lib/session-manager'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, deviceInfo } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for:', email)

    // STEP 1: HARD SESSION INVALIDATION BEFORE AUTH
    const serviceClient = createServiceRoleClient()

    if (serviceClient) {
      try {
        // Get user ID for this email using service role
        const { data: { user }, error: userError } = await serviceClient.auth.admin.getUserByEmail(email)

        if (user && !userError) {
          console.log(`Found user: ${user.id}, performing hard session invalidation`)

          // BRUTE FORCE: Mark ALL sessions as inactive first
          const { error: updateError } = await serviceClient
            .from('user_sessions')
            .update({
              is_active: false,
              last_active: new Date().toISOString(),
              invalidated_by: `pre_login_${Date.now()}`
            })
            .eq('user_id', user.id)

          if (updateError) {
            console.error('Error marking sessions inactive:', updateError)
          } else {
            console.log(`Hard invalidated all sessions for user ${user.id}`)
          }

          // Get all sessions to invalidate via Supabase auth
          const { data: existingSessions } = await serviceClient
            .from('user_sessions')
            .select('session_id')
            .eq('user_id', user.id)

          // Force invalidate via Supabase auth
          for (const session of existingSessions || []) {
            try {
              await serviceClient.auth.admin.signOut(session.session_id)
              console.log(`Force invalidated: ${session.session_id.substring(0, 20)}...`)
            } catch (e) {
              // Continue even if force invalidation fails
            }
          }

          // CRITICAL: Wait for invalidation to propagate
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log('Hard session invalidation complete')
        }
      } catch (invalidateError) {
        console.error('Hard invalidation failed:', invalidateError)
        // Continue with login anyway
      }
    }

    // STEP 2: NOW DO NORMAL AUTHENTICATION
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: authError.message || 'Authentication failed' },
        { status: 401 }
      )
    }

    if (!authData.session) {
      return NextResponse.json(
        { error: 'No session returned' },
        { status: 500 }
      )
    }

    const session = authData.session
    const userId = session.user.id
    const sessionId = session.access_token

    // Get client IP address
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    // STEP 3: CREATE NEW SESSION RECORD + ENSURE SINGLE SESSION
    try {
      // Create the new session record
      await SessionManager.createSessionRecord(
        userId,
        sessionId,
        deviceInfo,
        clientIP
      )
      console.log('New session record created successfully')

      // EXTRA SAFETY: Double-check and invalidate any other active sessions
      if (serviceClient) {
        const { data: allSessions } = await serviceClient
          .from('user_sessions')
          .select('session_id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .neq('session_id', sessionId)

        if (allSessions && allSessions.length > 0) {
          console.log(`SAFETY CHECK: Found ${allSessions.length} other active sessions, invalidating them`)

          for (const otherSession of allSessions) {
            try {
              await serviceClient.auth.admin.signOut(otherSession.session_id)
              console.log(`Safety invalidated: ${otherSession.session_id.substring(0, 20)}...`)
            } catch (e) {
              // Continue even if safety invalidation fails
            }
          }

          // Mark them as inactive in database too
          await serviceClient
            .from('user_sessions')
            .update({ is_active: false, last_active: new Date().toISOString() })
            .eq('user_id', userId)
            .neq('session_id', sessionId)

          console.log('Safety cleanup completed')
        }
      }
    } catch (sessionError) {
      console.error('Session management error:', sessionError)
      // Continue even if session management fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      session: {
        access_token: session.access_token,
        expires_at: session.expires_at,
      },
      message: 'Login successful - previous sessions invalidated'
    })

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}