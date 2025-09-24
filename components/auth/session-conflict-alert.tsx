'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useAuth } from './auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function SessionConflictAlert() {
  const { sessionConflict, clearSessionConflict } = useAuth()

  if (!sessionConflict) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right-4 duration-300">
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">
                Session Terminated
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                You were logged out because someone else logged into your account on another device.
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSessionConflict}
                  className="h-8 text-xs border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    clearSessionConflict()
                    window.location.href = '/auth/login'
                  }}
                  className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  Sign In Again
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}