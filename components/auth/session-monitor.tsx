'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './auth-provider'
import { toast } from 'sonner'
import { AlertTriangle, LogOut, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SessionInfo {
  id: string
  user_id: string
  session_id: string
  device_info: any
  ip_address: string | null
  created_at: string
  last_active: string
  is_active: boolean
}

interface SessionsResponse {
  sessions: SessionInfo[]
  currentSession?: {
    id: string
    createdAt: string
  }
}

export function SessionMonitor() {
  const { user, session } = useAuth()
  const [otherSessions, setOtherSessions] = useState<SessionInfo[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user || !session) {
      setOtherSessions([])
      setIsMonitoring(false)
      return
    }

    setIsMonitoring(true)

    // Check for other sessions immediately
    checkForOtherSessions()

    // Set up periodic monitoring
    const interval = setInterval(checkForOtherSessions, 15000) // Check every 15 seconds

    return () => {
      clearInterval(interval)
      setIsMonitoring(false)
    }
  }, [user, session])

  const checkForOtherSessions = async () => {
    if (!user || !session) return

    try {
      const response = await fetch('/api/auth/sessions')
      const data: SessionsResponse = await response.json()

      setOtherSessions(data.sessions || [])

      // Show warning if there are other active sessions
      if (data.sessions && data.sessions.length > 0) {
        const sessionInfo = data.sessions[0]
        const deviceName = sessionInfo.device_info?.userAgent?.substring(0, 50) || 'Unknown device'
        const timeAgo = new Date(sessionInfo.created_at).toLocaleString()

        toast.warning(
          `Another session detected! Someone logged in from ${deviceName} at ${timeAgo}`,
          {
            duration: 10000,
            action: {
              label: "Log Out Others",
              onClick: handleLogoutOthers
            },
            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
          }
        )
      }
    } catch (error) {
      console.error('Error checking sessions:', error)
    }
  }

  const handleLogoutOthers = async () => {
    if (!user || !session) return

    setIsLoading(true)

    try {
      // Invalidate all other sessions
      for (const otherSession of otherSessions) {
        try {
          const response = await fetch(`/api/auth/sessions?sessionId=${encodeURIComponent(otherSession.session_id)}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            console.error('Failed to invalidate session:', otherSession.session_id)
          }
        } catch (error) {
          console.error('Error invalidating session:', error)
        }
      }

      setOtherSessions([])

      toast.success(
        "Other sessions logged out - All other sessions have been terminated",
        {
          icon: <Shield className="h-5 w-5 text-green-500" />
        }
      )

      // Refresh the session list
      setTimeout(checkForOtherSessions, 1000)
    } catch (error) {
      console.error('Error logging out other sessions:', error)
      toast.error("Failed to log out other sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoutSelf = async () => {
    if (!user) return

    try {
      const { signOut } = useAuth()
      await signOut()
      toast.success("You have been logged out")
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error("Failed to log out")
    }
  }

  if (!user || !session || !isMonitoring) {
    return null
  }

  if (otherSessions.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Multiple Sessions Detected
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>We detected {otherSessions.length} other active session(s) on your account:</p>
              <ul className="mt-1 space-y-1">
                {otherSessions.map((otherSession, index) => (
                  <li key={otherSession.id} className="text-xs">
                    • {otherSession.device_info?.userAgent?.substring(0, 60) || 'Unknown device'}
                    ({new Date(otherSession.created_at).toLocaleString()})
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogoutOthers}
                disabled={isLoading || otherSessions.length === 0}
                className="text-xs"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Shield className="h-3 w-3 mr-1" />
                )}
                Log Out Others
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleLogoutSelf}
                className="text-xs"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Log Out Me
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}