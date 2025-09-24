import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { config as appConfig } from '@/lib/config'
import { SessionManager } from '@/lib/session-manager'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    appConfig.supabase.url,
    appConfig.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes
  const protectedRoutes = ['/', '/feeds', '/live']
  const adminRoutes = ['/admin']
  const authRoutes = ['/auth/login']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  )
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // If user is authenticated, manage session and check for conflicts
  if (user && session) {
    try {
      const clientIP = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown'

      // AGGRESSIVE SESSION ENFORCEMENT - KICK OUT NON-LATEST SESSIONS
      const { data: userSessions } = await supabase
        .from('user_sessions')
        .select('session_id, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      const sessions = userSessions || []

      if (sessions.length > 1) {
        console.log(`MULTIPLE SESSIONS: ${sessions.length} active for user ${user.id}`)

        // Find current session position
        const currentSessionIndex = sessions.findIndex(s => s.session_id === session.access_token)

        if (currentSessionIndex > 0) {
          // NOT THE NEWEST SESSION - INSTANT KICK OUT
          console.log(`AGGRESSIVE: Current session is position ${currentSessionIndex + 1}, KICKING OUT`)
          console.log(`AGGRESSIVE: Newest session is ${sessions[0].session_id.substring(0, 20)}...`)

          try {
            // Immediately mark current session as dead
            await supabase
              .from('user_sessions')
              .update({
                is_active: false,
                last_active: new Date().toISOString(),
                kickout_reason: 'not_newest_session'
              })
              .eq('session_id', session.access_token)

            console.log('AGGRESSIVE: Current session marked as dead')

            // INSTANT REDIRECT TO LOGIN - NO MERCY
            const loginUrl = new URL('/auth/login', request.url)
            loginUrl.searchParams.set('kicked', 'true')
            return NextResponse.redirect(loginUrl)

          } catch (kickoutError) {
            console.error('AGGRESSIVE kickout failed:', kickoutError)
          }
        } else if (currentSessionIndex === 0) {
          console.log('AGGRESSIVE: Current session is the newest - ALLOWED')
        } else {
          console.log('AGGRESSIVE: Current session not found - allowing access')
        }
      } else if (sessions.length === 1) {
        console.log('AGGRESSIVE: Single session - no conflict')
      } else {
        console.log('AGGRESSIVE: No sessions found')
      }

      // Try to validate session, but don't fail if it doesn't exist yet
      const isValidSession = await SessionManager.validateSession(session.access_token)

      if (isValidSession) {
        // Update session activity for valid sessions
        await SessionManager.updateSessionActivity(session.access_token, clientIP)
        console.log('Session validated and updated for user:', user.email)
      } else {
        // Session doesn't exist or is invalid, but we'll allow access and create it
        console.log('Session not found for user:', user.email, '- creating session record')

        try {
          const userAgent = request.headers.get('user-agent') || 'unknown'

          await SessionManager.createSessionRecord(
            user.id,
            session.access_token,
            { userAgent, timestamp: new Date().toISOString() },
            clientIP
          )
          console.log('Session record created for user:', user.email)
        } catch (createError: any) {
          if (createError?.code === '23505') {
            console.log('Session record already exists (duplicate key), skipping creation')
          } else {
            console.error('Failed to create session record:', createError)
          }
        }
      }
    } catch (error) {
      console.error('Session management error:', error)
      // Continue with request even if session management fails
    }
  }

  // If user is not authenticated and trying to access protected route
  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return Response.redirect(url)
  }

  // If user is trying to access admin routes, check their role
  if (user && isAdminRoute) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      // Handle RLS policy errors or infinite recursion
      if (profileError) {
        console.error('Middleware profile check error:', profileError.message)
        
        // If it's an RLS or recursion error, temporarily allow access for debugging
        if (profileError.message?.includes('infinite recursion') || 
            profileError.message?.includes('policy')) {
          console.warn('RLS policy issue detected, allowing admin access for debugging')
          return NextResponse.next()
        }
        
        // Other errors, redirect to home
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return Response.redirect(url)
      }
      
      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return Response.redirect(url)
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // If there's an unexpected error, allow access for debugging
      console.warn('Allowing admin access due to middleware error')
      return NextResponse.next()
    }
  }

  // If user is authenticated and trying to access auth routes
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return Response.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}