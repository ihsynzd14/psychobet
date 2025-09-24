'use client'

import { LoginForm } from '@/components/auth/login-form'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const hasConflict = searchParams.get('conflict') === 'true'
  const wasKicked = searchParams.get('kicked') === 'true'

  useEffect(() => {
    if (hasConflict) {
      // Store conflict flag in localStorage for the login form to handle
      localStorage.setItem('session_conflict', 'true')
    }

    if (wasKicked) {
      // Store kick flag in localStorage
      localStorage.setItem('session_kicked', 'true')
    }
  }, [hasConflict, wasKicked])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Animated Container */}
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <LoginForm />
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <p className="text-xs text-muted-foreground">
              © 2025 Psychoff Radar System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}