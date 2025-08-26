import { createBrowserClient } from '@supabase/ssr'
import { config, validateSupabaseConfig } from '@/lib/config'

export function createClient() {
  // Validate configuration before creating client
  validateSupabaseConfig()
  
  const { url, anonKey } = config.supabase

  return createBrowserClient(url, anonKey)
}