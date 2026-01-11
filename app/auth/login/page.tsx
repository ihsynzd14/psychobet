'use client'

import { LoginForm } from '@/components/auth/login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const hasConflict = searchParams.get('conflict') === 'true'
  const wasKicked = searchParams.get('kicked') === 'true'

  useEffect(() => {
    if (hasConflict) {
      localStorage.setItem('session_conflict', 'true')
    }

    if (wasKicked) {
      localStorage.setItem('session_kicked', 'true')
    }
  }, [hasConflict, wasKicked])

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
      {/* Radar Grid Background */}
      <div className="absolute inset-0 opacity-10 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(59, 130, 246, 0.1) 40%, rgba(59, 130, 246, 0.1) 41%, transparent 41%),
            radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(59, 130, 246, 0.1) 60%, rgba(59, 130, 246, 0.1) 61%, transparent 61%),
            radial-gradient(circle at center, transparent 0%, transparent 80%, rgba(59, 130, 246, 0.1) 80%, rgba(59, 130, 246, 0.1) 81%, transparent 81%)
          `,
          backgroundSize: '800px 800px',
          backgroundPosition: 'center'
        }} />
      </div>

      {/* Scanning Line Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 animate-radar-scan" style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.03) 50%, transparent 100%)',
          height: '200px',
          animationDuration: '8s'
        }} />
      </div>

      {/* Corner Technical Markers */}
      <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-blue-500/30 dark:border-blue-500/30" />
      <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-blue-500/30 dark:border-blue-500/30" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-blue-500/30 dark:border-blue-500/30" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-blue-500/30 dark:border-blue-500/30" />

      {/* Technical Data Points - Left Side */}
      <div className="absolute top-12 left-12 font-mono text-[10px] text-blue-600/60 dark:text-blue-500/40 tracking-wider">
        SYS: ONLINE
      </div>

      {/* Right Side Controls - Aligned */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-6">
        {/* Theme Toggle - System Control */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block font-mono text-[10px] text-blue-600/60 dark:text-blue-500/40 tracking-wider uppercase">
            Display Mode
          </span>
          <div className="p-2 bg-white/50 dark:bg-slate-900/70 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-colors duration-200 shadow-sm">
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="absolute bottom-12 left-12 font-mono text-[10px] text-blue-600/60 dark:text-blue-500/40 tracking-wider">
        LATENCY: 12ms
      </div>
      <div className="absolute bottom-12 right-12 font-mono text-[10px] text-blue-600/60 dark:text-blue-500/40 tracking-wider">
        V: 2.4.1
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Animated Container */}
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            <LoginForm />
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <p className="text-[10px] text-slate-500 dark:text-slate-600 font-mono tracking-wider uppercase">
              © 2025 Psychoff Radar System. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx global>{`
        @keyframes radar-scan {
          0% {
            transform: translateY(-200px);
          }
          100% {
            transform: translateY(calc(100vh + 200px));
          }
        }

        .animate-radar-scan {
          animation: radar-scan 8s linear infinite;
        }
      `}</style>
    </div>
  )
}
