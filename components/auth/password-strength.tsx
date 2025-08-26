'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface PasswordCriteria {
  id: string
  label: string
  test: (password: string) => boolean
}

const passwordCriteria: PasswordCriteria[] = [
  {
    id: 'length',
    label: 'At least 6 characters',
    test: (password) => password.length >= 6,
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number',
    test: (password) => /\d/.test(password),
  },
]

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const getStrengthLevel = () => {
    const passedCriteria = passwordCriteria.filter(criteria => criteria.test(password))
    return passedCriteria.length
  }

  const getStrengthLabel = (level: number) => {
    if (level === 0) return 'Very Weak'
    if (level === 1) return 'Weak'
    if (level === 2) return 'Fair'
    if (level === 3) return 'Good'
    if (level === 4) return 'Strong'
    return 'Very Weak'
  }

  const getStrengthColor = (level: number) => {
    if (level === 0) return 'bg-red-500'
    if (level === 1) return 'bg-red-400'
    if (level === 2) return 'bg-yellow-500'
    if (level === 3) return 'bg-blue-500'
    if (level === 4) return 'bg-green-500'
    return 'bg-gray-200'
  }

  const strengthLevel = getStrengthLevel()
  
  if (!password) return null

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">
            Password Strength
          </span>
          <span className={cn(
            'text-xs font-semibold',
            strengthLevel >= 3 ? 'text-green-600' : strengthLevel >= 2 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {getStrengthLabel(strengthLevel)}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-300',
                level <= strengthLevel 
                  ? getStrengthColor(strengthLevel)
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>
      </div>

      {/* Criteria List */}
      <div className="space-y-1">
        {passwordCriteria.map((criteria) => {
          const isPassed = criteria.test(password)
          return (
            <div
              key={criteria.id}
              className={cn(
                'flex items-center space-x-2 text-xs transition-colors duration-200',
                isPassed ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {isPassed ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
              <span>{criteria.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}