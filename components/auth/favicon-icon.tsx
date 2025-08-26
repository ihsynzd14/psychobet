'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FaviconIconProps {
  className?: string
  size?: number
}

export function FaviconIcon({ className, size = 32 }: FaviconIconProps) {
  return (
    <Image
      src="/favicon.ico"
      alt="Psychobet Logo"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority
    />
  )
}