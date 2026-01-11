'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { EnhancedInput } from '@/components/ui/enhanced-input'
import { AuthCard, AuthCardContent, AuthCardFooter, AuthCardHeader, AuthCardTitle, AuthCardDescription } from '@/components/ui/auth-card'
import { SecurityIcon } from '@/components/auth/auth-icons'
import { FaviconIcon } from '@/components/auth/favicon-icon'
import { useAuth } from '@/components/auth/auth-provider'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, ExternalLink, ShoppingCart, Radar, Activity } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithEmail, loading: authLoading } = useAuth()
  const router = useRouter()

  const isProcessing = isLoading || authLoading

  const schema = loginSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const onSubmit = async (data: LoginFormData) => {
    if (isProcessing) {
      console.log('Login already in progress, ignoring duplicate submission')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting login for:', data.email)

      const { error } = await signInWithEmail(data.email, data.password)

      if (error) {
        console.error('Login failed:', error.message)
        toast.error(error.message || 'Authentication failed', {
          icon: <AlertCircle className="h-4 w-4" />,
        })
        return
      }

      console.log('Auth provider login successful')

      console.log('Login successful, setting up session...')

      toast.success('Welcome back! Setting up your session...', {
        icon: <FaviconIcon size={16} />,
      })

      try {
        const response = await fetch('/api/auth/setup-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          console.warn('Session setup failed, but login was successful')
        } else {
          const result = await response.json()
          console.log('Session setup completed successfully:', result.message)
        }
      } catch (sessionError) {
        console.warn('Session setup error:', sessionError)
      }

      setTimeout(() => {
        console.log('Redirecting to dashboard...')
        router.replace('/')
        router.refresh()
      }, 300)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('Unexpected login error:', errorMessage)
      toast.error(errorMessage, {
        icon: <AlertCircle className="h-4 w-4" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseRedirect = () => {
    window.open('https://www.psychoff.co.uk/psychoff-radar', '_blank')
  }

  return (
    <>
      <AuthCard className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-700" hover="radar">
        {/* Header */}
        <AuthCardHeader>
          <div className="mx-auto mb-6 relative">
            {/* Icon Container */}
            <div className="relative p-4 rounded-full bg-slate-100 dark:bg-slate-900 border border-blue-500/30 w-fit transition-all duration-500 hover:border-blue-500/60">
              <FaviconIcon className="h-8 w-8" size={32} />
            </div>
          </div>

          <div className="transition-all duration-300 animate-in slide-in-from-left-4">
            <AuthCardTitle>
              System Access
            </AuthCardTitle>
            <AuthCardDescription>
              Authenticate to access Psychoff Radar analytics
            </AuthCardDescription>
          </div>
        </AuthCardHeader>

        {/* Form */}
        <AuthCardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="animate-in slide-in-from-left-4 duration-500 delay-100">
              <EnhancedInput
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                error={errors.email?.message}
                leftIcon={<Mail className="h-4 w-4" />}
                disabled={isProcessing}
                size="lg"
                variant="radar"
              />
            </div>

            {/* Password Field */}
            <div className="animate-in slide-in-from-left-4 duration-500 delay-200 space-y-3">
              <EnhancedInput
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-800"
                    disabled={isProcessing}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                disabled={isProcessing}
                size="lg"
                variant="radar"
              />
            </div>

            {/* Submit Button */}
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
              <EnhancedButton
                type="submit"
                className="w-full"
                loading={isProcessing}
                disabled={isProcessing || !isValid}
                variant="radar"
                size="lg"
                rightIcon={!isProcessing && <ArrowRight className="h-4 w-4" />}
              >
                {isProcessing ? 'Authenticating...' : 'Access System'}
              </EnhancedButton>
            </div>
          </form>
        </AuthCardContent>

        {/* Footer */}
        <AuthCardFooter>
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-400 text-center space-y-4">
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-100 dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-500 font-mono tracking-wider">
                  New User?
                </span>
              </div>
            </div>

            {/* Purchase Product Link */}
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Acquire Psychoff Radar for access credentials
              </p>
              <button
                type="button"
                onClick={handlePurchaseRedirect}
                className="group inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-all duration-200 p-3 rounded-lg hover:bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/60 w-full justify-center"
                disabled={isLoading}
              >
                <ShoppingCart className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span>Purchase Psychoff Radar</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </button>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-300 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-600/50 transition-colors duration-200">
              <SecurityIcon className="h-3 w-3" />
              <span className="font-mono tracking-wide">ENCRYPTED CONNECTION</span>
            </div>

            {/* Technical Footer */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 font-mono tracking-wider uppercase">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>Live Data</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1">
                <Radar className="h-3 w-3" />
                <span>Radar Active</span>
              </div>
            </div>
          </div>
        </AuthCardFooter>
      </AuthCard>

      {/* Custom Styles for Radar Animations */}
      <style jsx global>{`
        @keyframes radar-ping {
          0% {
            opacity: 1;
          }
          75%, 100% {
            opacity: 0;
          }
        }

        .animate-radar-ping {
          animation: radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  )
}
