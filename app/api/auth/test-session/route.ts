import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const serviceClient = createServiceRoleClient()

    // Test 1: Check if table exists
    let tableExists = false
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('count', { count: 'exact', head: true })

      if (!error) {
        tableExists = true
      }
    } catch (error) {
      console.log('Table does not exist or access denied:', error)
    }

    // Test 2: Check if we can insert a test record
    let insertTest = false
    if (tableExists && serviceClient) {
      try {
        const { data, error } = await serviceClient
          .from('user_sessions')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            session_id: 'test-session-' + Date.now(),
            device_info: { test: true },
            ip_address: '127.0.0.1',
          })

        if (!error) {
          insertTest = true
          // Clean up test record
          await serviceClient
            .from('user_sessions')
            .delete()
            .eq('user_id', '00000000-0000-0000-0000-000000000000')
        }
      } catch (error) {
        console.log('Insert test failed:', error)
      }
    }

    // Test 3: Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    return NextResponse.json({
      tableExists,
      insertTest,
      serviceRoleAvailable: !!serviceClient,
      currentSession: session ? {
        userId: session.user.id,
        email: session.user.email,
        sessionId: session.access_token?.substring(0, 20) + '...',
      } : null,
      sessionError: sessionError?.message,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗',
      }
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}