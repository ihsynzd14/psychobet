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

    // Create server client for authentication
    const supabase = createClient()

    // Attempt to sign in
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

    try {
      // First create session record, then invalidate previous ones
      await SessionManager.createSessionRecord(
        userId,
        sessionId,
        deviceInfo,
        clientIP
      )

      // Then invalidate all previous sessions for this user
      await SessionManager.invalidatePreviousSessions(userId, sessionId)

    } catch (sessionError) {
      console.error('Session management error:', sessionError)
      // Don't fail the login if session management fails
      // Log the error for debugging
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
      }
    })

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}