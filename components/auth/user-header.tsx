'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { useUserProfile } from '@/hooks/use-user-profile'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Trophy, User2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function UserHeader() {
  const { user, signOut } = useAuth()
  const { isAdmin } = useUserProfile()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  const handleNavigateToProfile = () => {
    router.push('/')
  }

  const handleNavigateToFeeds = () => {
    router.push('/feeds')
  }

  const handleNavigateToAdmin = () => {
    router.push('/admin')
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Psychoff Radar System
        </h1>
      </div>
      
      {/* Navigation Links */}
      <div className="flex items-center gap-3">
        {/* Live Fixtures - Enhanced with color and background */}
        <Button 
          onClick={handleNavigateToFeeds}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm border-0 transition-all duration-200 hover:shadow-md"
        >
          <Trophy className="h-4 w-4" />
          <span className="font-medium">Live Fixtures</span>
        </Button>
        
        {/* Admin Panel - Only visible to admins */}
        {isAdmin && (
          <Button 
            variant="outline" 
            onClick={handleNavigateToAdmin}
            className="flex items-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Admin Panel</span>
          </Button>
        )}
      </div>
      
      {/* Theme Toggle */}
      <ThemeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <div className="flex h-full w-full items-center justify-center bg-gray-300 dark:bg-gray-600">
                <User className="h-4 w-4" />
              </div>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleNavigateToProfile}>
            <User2 className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}