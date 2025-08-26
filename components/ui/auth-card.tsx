'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const authCardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-300 ease-in-out',
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
        glow: 'hover:shadow-2xl hover:shadow-primary/10',
      },
    },
    defaultVariants: {
      size: 'default',
      hover: 'glow',
    },
  }
)

export interface AuthCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof authCardVariants> {}

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
    className={cn('flex flex-col space-y-3 text-center mb-8', className)}
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
      'text-3xl font-bold leading-tight tracking-tight text-foreground',
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
    className={cn('text-muted-foreground text-base leading-relaxed', className)}
    {...props}
  />
))
AuthCardDescription.displayName = 'AuthCardDescription'

const AuthCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-6', className)} {...props} />
))
AuthCardContent.displayName = 'AuthCardContent'

const AuthCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col items-center space-y-4 mt-8', className)}
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