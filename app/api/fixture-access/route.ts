import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fixtureId = searchParams.get('fixtureId')
  
  if (!fixtureId) {
    return NextResponse.json({ error: 'Fixture ID is required' }, { status: 400 })
  }

  const supabase = createClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
    
    // Admins have access to all fixtures
    if (isAdmin) {
      return NextResponse.json({ hasAccess: true })
    }
    
    // Check if user has direct access to this fixture
    const { data: fixtureAccess } = await supabase
      .from('user_fixture_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('fixture_id', fixtureId)
      .single()
    
    // Check if user has access through league access
    // This would require checking the fixture's competition against user's accessible leagues
    
    const hasAccess = !!fixtureAccess
    
    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error('Error checking fixture access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}