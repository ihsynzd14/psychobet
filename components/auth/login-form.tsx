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
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, ExternalLink, ShoppingCart } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithEmail } = useAuth()
  const router = useRouter()

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
    setIsLoading(true)

    try {
      // Try regular authentication first
      const { error } = await signInWithEmail(data.email, data.password)

      if (error) {
        toast.error(error.message || 'Authentication failed', {
          icon: <AlertCircle className="h-4 w-4" />,
        })
        return
      }

      toast.success('Welcome back! Setting up your session...', {
        icon: <FaviconIcon size={16} />,
      })

      // Setup session management after successful login
      try {
        const response = await fetch('/api/auth/setup-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          console.warn('Session setup failed, but login was successful')
        }
      } catch (sessionError) {
        console.warn('Session setup error:', sessionError)
        // Don't fail the login if session management fails
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
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
    <AuthCard className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-700" hover="glow">
      {/* Header */}
      <AuthCardHeader>
        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit transition-all duration-500 hover:scale-110">
          <FaviconIcon className="h-8 w-8" size={32} />
        </div>
        
        <div className="transition-all duration-300 animate-in slide-in-from-left-4">
          <AuthCardTitle>
            Welcome Back
          </AuthCardTitle>
          <AuthCardDescription>
            Sign in to access your Psychoff Radar dashboard
          </AuthCardDescription>
        </div>
      </AuthCardHeader>

      {/* Form */}
      <AuthCardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div className="animate-in slide-in-from-left-4 duration-500 delay-100">
            <EnhancedInput
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              error={errors.email?.message}
              leftIcon={<Mail className="h-4 w-4" />}
              disabled={isLoading}
              size="lg"
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
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              disabled={isLoading}
              size="lg"
            />
          </div>

          {/* Submit Button */}
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
            <EnhancedButton
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
              variant="gradient"
              size="lg"
              rightIcon={!isLoading && <ArrowRight className="h-4 w-4" />}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
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
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Purchase Product Link */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Purchase Psychoff Radar to get your login credentials
            </p>
            <button
              type="button"
              onClick={handlePurchaseRedirect}
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200 p-3 rounded-lg hover:bg-primary/5 hover:scale-105 border border-primary/20 hover:border-primary/40"
              disabled={isLoading}
            >
              <ShoppingCart className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span>Purchase Psychoff Radar</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </button>
          </div>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors duration-200">
            <SecurityIcon className="h-3 w-3" />
            <span>Your data is secured with enterprise-grade encryption</span>
          </div>
        </div>
      </AuthCardFooter>
    </AuthCard>
  )
}