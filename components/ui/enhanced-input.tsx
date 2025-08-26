'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full rounded-lg border bg-background px-4 py-3 text-sm transition-all duration-200 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
        error: 'border-destructive focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/20',
        success: 'border-green-500 focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20',
      },
      size: {
        default: 'h-12 px-4 py-3',
        sm: 'h-10 px-3 py-2 text-xs',
        lg: 'h-14 px-5 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type, 
    label, 
    error, 
    success, 
    hint, 
    leftIcon, 
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = id || React.useId()
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`
    
    // Determine variant based on state
    const effectiveVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant: effectiveVariant, size, className }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="text-sm text-destructive font-medium animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="text-sm text-green-600 font-medium animate-in slide-in-from-top-1 duration-200">
            {success}
          </p>
        )}
        
        {hint && !error && !success && (
          <p id={hintId} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = 'EnhancedInput'

export { EnhancedInput, inputVariants }