'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  // State to track if component is mounted (to prevent hydration mismatch)
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Only show the toggle after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative h-9 w-16 rounded-full border-none bg-muted p-0 shadow-sm transition-all duration-300 hover:shadow-md focus-visible:ring-offset-2"
    >
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun className="h-4 w-4 text-yellow-500 transition-opacity duration-300" 
             style={{ opacity: theme === 'dark' ? 0.5 : 1 }} />
        <Moon className="h-4 w-4 text-blue-400 transition-opacity duration-300" 
              style={{ opacity: theme === 'dark' ? 1 : 0.5 }} />
      </div>
      
      {/* Sliding toggle indicator */}
      <div 
        className={`absolute h-7 w-7 rounded-full shadow-md transition-all duration-300 ${
          theme === 'dark' 
            ? 'left-[calc(100%-1.85rem)] bg-gray-800' 
            : 'left-[0.2rem] bg-white'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
        ) : (
          <Sun className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-500" />
        )}
      </div>
    </Button>
  );
} 