import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config, validateSupabaseConfig } from '@/lib/config'

export function createClient() {
  const cookieStore = cookies()
  
  // Validate configuration before creating client
  validateSupabaseConfig()
  
  const { url, anonKey } = config.supabase

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}