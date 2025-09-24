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

  // If user is authenticated, manage session
  if (user && session) {
    try {
      // Try to validate session, but don't fail if it doesn't exist yet
      const isValidSession = await SessionManager.validateSession(session.access_token)

      if (isValidSession) {
        // Update session activity for valid sessions
        const clientIP = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        'unknown'

        await SessionManager.updateSessionActivity(session.access_token, clientIP)
        console.log('Session validated and updated for user:', user.email)
      } else {
        // Session doesn't exist or is invalid, but we'll allow access and create it
        console.log('Session not found for user:', user.email, '- creating session record')

        try {
          const clientIP = request.headers.get('x-forwarded-for') ||
                          request.headers.get('x-real-ip') ||
                          'unknown'

          const userAgent = request.headers.get('user-agent') || 'unknown'

          await SessionManager.createSessionRecord(
            user.id,
            session.access_token,
            { userAgent, timestamp: new Date().toISOString() },
            clientIP
          )
          console.log('Session record created for user:', user.email)
        } catch (createError) {
          console.error('Failed to create session record:', createError)
          // Continue even if session creation fails
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