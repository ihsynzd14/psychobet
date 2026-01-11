'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const enhancedButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-primary',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:ring-ring',
        ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-ring',
        gradient: 'bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-primary focus-visible:ring-primary',
        radar: 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30 hover:bg-blue-500 dark:hover:bg-blue-600 hover:shadow-blue-500/30 dark:hover:shadow-blue-500/40 hover:scale-[1.02] focus-visible:ring-blue-500 border border-blue-500/50 dark:border-blue-500/60',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2 text-xs',
        lg: 'h-14 px-8 py-4 text-base',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)

EnhancedButton.displayName = 'EnhancedButton'

export { EnhancedButton, enhancedButtonVariants }