import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ sessions: [] })
    }

    // Get all active sessions for the current user
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ sessions: [] })
    }

    // Filter out the current session for security
    const otherSessions = (sessions || []).filter(s => s.session_id !== session.access_token)

    return NextResponse.json({
      sessions: otherSessions,
      currentSession: {
        id: session.access_token?.substring(0, 20) + '...',
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json({ sessions: [] })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetSessionId = searchParams.get('sessionId')

    if (!targetSessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Create service client for admin operations
    const serviceClient = await import('@/lib/supabase/service-role').then(m => m.createServiceRoleClient())

    if (!serviceClient) {
      return NextResponse.json({ error: 'Service client not available' }, { status: 500 })
    }

    // Invalidate the target session via Supabase auth
    try {
      await serviceClient.auth.admin.signOut(targetSessionId)
    } catch (signOutError) {
      console.error('Error signing out session:', signOutError)
      // Continue with database invalidation even if auth signout fails
    }

    // Mark session as inactive in database
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        last_active: new Date().toISOString(),
        invalidated_by: 'user_action'
      })
      .eq('session_id', targetSessionId)

    if (updateError) {
      console.error('Error updating session:', updateError)
      return NextResponse.json({ error: 'Failed to invalidate session' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Session invalidated successfully'
    })

  } catch (error) {
    console.error('Session deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}