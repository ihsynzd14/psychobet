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
    const { data: fixtureAccess, error: fixtureAccessError } = await supabase
      .from('user_fixture_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('fixture_id', fixtureId)
      .single()
    
    // If user has direct fixture access, grant access
    if (fixtureAccess) {
      return NextResponse.json({ hasAccess: true })
    }
    
    // Check if user has access through league access
    // First, get the fixture details to find its competition ID
    try {
      const { apiV2 } = await import('@/lib/api-v2')
      const fixture = await apiV2.getFixture(fixtureId)
      
      if (fixture && fixture.competition) {
        // Get user's league access
        const { data: userLeagueAccess } = await supabase
          .from('user_league_access')
          .select('league_id')
          .eq('user_id', user.id)
        
        if (userLeagueAccess && userLeagueAccess.length > 0) {
          // Check if user has access to this fixture's competition
          const competitionId = fixture.competition.id.toString()
          const userLeagueIds = userLeagueAccess.map(ula => ula.league_id)
          
          // Check for direct competition match or full bundle access
          const hasCompetitionAccess = userLeagueIds.includes(competitionId) || userLeagueIds.includes('987123645')
          
          if (hasCompetitionAccess) {
            return NextResponse.json({ hasAccess: true })
          }
        }
      }
    } catch (fixtureError) {
      console.error('Error fetching fixture details for league access check:', fixtureError)
      // If we can't fetch fixture details, fall back to direct access only
    }
    
    const hasAccess = false
    
    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error('Error checking fixture access:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}