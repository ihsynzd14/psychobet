// Configuration utility to handle environment variables
// This ensures compatibility across different environments and bundlers

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpormbnpkdvcwlgydwfw.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb3JtYm5wa2R2Y3dsZ3lkd2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjQwMjYsImV4cCI6MjA3MTc0MDAyNn0.7pdwzCC0AxCbDKUAYDsxbEv8q7LbrK3OvHZwi0ZjYHo',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb3JtYm5wa2R2Y3dsZ3lkd2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE2NDAyNiwiZXhwIjoyMDcxNzQwMDI2fQ.yLEec__plGnVcQkLOHzbROprSgDK9ICsNRWB503sRT8',
  },
}

// Validation function to ensure configuration is available
export function validateSupabaseConfig() {
  if (!config.supabase.url) {
    throw new Error('Supabase URL is not configured')
  }
  if (!config.supabase.anonKey) {
    throw new Error('Supabase Anonymous Key is not configured')
  }
  if (!config.supabase.serviceRoleKey) {
    throw new Error('Supabase Service Role Key is not configured')
  }
}

export default config