'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Activity,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  currentPath: string;
  onMobileToggle?: () => void;
  isMobile?: boolean;
  onWidthChange?: (width: number) => void;
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage all users'
  },
  {
    title: 'Add User',
    href: '/admin/users/new',
    icon: UserPlus,
    description: 'Create new user'
  },
 
];

interface NavItemProps {
  item: typeof adminNavItems[0];
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}

function NavItem({ item, isActive, isExpanded, onClick }: NavItemProps) {
  const content = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center rounded-lg transition-all duration-200 group relative",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isExpanded ? "px-3 py-2 space-x-3" : "p-3 justify-center",
        isActive
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-700 dark:text-gray-300'
      )}
    >
      <item.icon 
        className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'
        )} 
      />
      {isExpanded && (
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium truncate">{item.title}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {item.description}
          </span>
        </div>
      )}
    </Link>
  );

  if (!isExpanded) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            <div className="flex flex-col">
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-gray-500">{item.description}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

export function AdminSidebar({ currentPath, onMobileToggle, isMobile = false, onWidthChange }: AdminSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Update body class and notify parent of width changes
  useEffect(() => {
    if (!isMobile) {
      const mainContent = document.querySelector('.admin-main-content');
      if (mainContent) {
        mainContent.classList.remove('admin-main-collapsed', 'admin-main-expanded');
        mainContent.classList.add(isExpanded ? 'admin-main-expanded' : 'admin-main-collapsed');
      }
      onWidthChange?.(isExpanded ? 320 : 64);
    }
  }, [isExpanded, isMobile, onWidthChange]);

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      isExpanded ? "w-80" : "w-16",
      isMobile && "w-80" // Always expanded on mobile
    )}>
      {/* Logo/Brand */}
      <div className={cn(
        "border-b border-gray-200 dark:border-gray-700 flex items-center",
        isExpanded ? "p-6" : "p-4 justify-center"
      )}>
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          {(isExpanded || isMobile) && (
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                PsychoBet
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Admin Panel
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Toggle Button (Desktop only) */}
      {!isMobile && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className={cn(
              "w-full transition-all duration-200",
              isExpanded ? "justify-start" : "justify-center"
            )}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {adminNavItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={currentPath === item.href}
            isExpanded={isExpanded || isMobile}
            onClick={onMobileToggle}
          />
        ))}
      </nav>

      {/* Quick Links */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  onClick={onMobileToggle}
                  className={cn(
                    "flex items-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-200",
                    isExpanded || isMobile ? "px-3 py-2 space-x-3" : "p-3 justify-center"
                  )}
                >
                  <Home className="h-4 w-4 flex-shrink-0" />
                  {(isExpanded || isMobile) && (
                    <span className="text-sm">Back to App</span>
                  )}
                </Link>
              </TooltipTrigger>
              {!isExpanded && !isMobile && (
                <TooltipContent side="right" className="ml-2">
                  Back to App
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}