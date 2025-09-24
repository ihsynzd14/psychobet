import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { SessionManager } from '@/lib/session-manager'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json()

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Validate the session
    const isValid = await SessionManager.validateSession(session_id)

    if (!isValid) {
      return NextResponse.json({
        valid: false,
        reason: 'session_invalid'
      })
    }

    // Update session activity
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    await SessionManager.updateSessionActivity(session_id, clientIP)

    return NextResponse.json({
      valid: true,
      message: 'Session is valid'
    })

  } catch (error) {
    console.error('Session validation API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}