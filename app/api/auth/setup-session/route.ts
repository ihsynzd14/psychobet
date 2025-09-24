import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { SessionManager } from '@/lib/session-manager'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the session from the request
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      )
    }

    // First ensure user profile exists
    try {
      const profileResponse = await fetch(`${request.nextUrl.origin}/api/auth/ensure-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
      })

      if (!profileResponse.ok) {
        console.warn('Profile creation failed, but continuing with session setup')
      }
    } catch (profileError) {
      console.warn('Profile setup error:', profileError)
      // Continue even if profile creation fails
    }

    // Get client IP address
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    // Get device info from request
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const deviceInfo = {
      userAgent,
      timestamp: new Date().toISOString(),
    }

    try {
      // Create session record
      await SessionManager.createSessionRecord(
        session.user.id,
        session.access_token,
        deviceInfo,
        clientIP
      )

      // Invalidate previous sessions
      await SessionManager.invalidatePreviousSessions(session.user.id, session.access_token)

      return NextResponse.json({
        success: true,
        message: 'Session setup completed'
      })

    } catch (sessionError) {
      console.error('Session setup error:', sessionError)
      // Don't fail the request if session management fails
      return NextResponse.json({
        success: true,
        message: 'Session setup completed with warnings',
        warning: 'Session management had issues but login was successful'
      })
    }

  } catch (error) {
    console.error('Session setup API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}