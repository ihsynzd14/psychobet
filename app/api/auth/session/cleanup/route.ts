import { SessionManager } from '@/lib/session-manager'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clean up old sessions (older than 24 hours)
    await SessionManager.cleanupOldSessions()

    return NextResponse.json({
      success: true,
      message: 'Old sessions cleaned up successfully'
    })

  } catch (error) {
    console.error('Session cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    )
  }
}