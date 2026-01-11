'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const authCardVariants = cva(
  'rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl transition-all duration-300 ease-in-out',
  {
    variants: {
      size: {
        default: 'p-8',
        sm: 'p-6',
        lg: 'p-10',
      },
      hover: {
        none: '',
        lift: 'hover:shadow-xl hover:-translate-y-1',
        glow: 'hover:shadow-2xl hover:shadow-blue-500/10',
        radar: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/40 hover:scale-[1.00]',
      },
    },
    defaultVariants: {
      size: 'default',
      hover: 'radar',
    },
  }
)

export interface AuthCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof authCardVariants> { }

const AuthCard = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ className, size, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(authCardVariants({ size, hover, className }))}
      {...props}
    />
  )
)
AuthCard.displayName = 'AuthCard'

const AuthCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-4 text-center mb-8', className)}
    {...props}
  />
))
AuthCardHeader.displayName = 'AuthCardHeader'

const AuthCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider',
      className
    )}
    {...props}
  />
))
AuthCardTitle.displayName = 'AuthCardTitle'

const AuthCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-normal', className)}
    {...props}
  />
))
AuthCardDescription.displayName = 'AuthCardDescription'

const AuthCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-5', className)} {...props} />
))
AuthCardContent.displayName = 'AuthCardContent'

const AuthCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col items-center space-y-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800', className)}
    {...props}
  />
))
AuthCardFooter.displayName = 'AuthCardFooter'

export {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
}
