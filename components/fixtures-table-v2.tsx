import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Calendar,
  MapPin,
  Radio,
  Shield,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FixtureV2 } from '@/lib/api-v2';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

interface FixturesTableV2Props {
  fixtures: FixtureV2[];
  isLoading?: boolean;
}

// Extract team metadata with proper typing
function getMetadataValue(competitor: any, propertyName: string): string {
  if (!competitor?.metadataProperties) return '';
  
  // Handle array format (more common in real APIs)
  if (Array.isArray(competitor.metadataProperties)) {
    const prop = competitor.metadataProperties.find(
      (prop: any) => prop.name === propertyName
    );
    return prop?.value || '';
  }
  
  // Handle object format (fallback)
  return competitor.metadataProperties[propertyName] || '';
}

// Performance-optimized component using memoization where appropriate
function FixturesTableV2Component({ fixtures, isLoading }: FixturesTableV2Props) {
  // Animation variants optimized for better performance
  const tableRowVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.15
      } 
    },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  }), []);

  // Live button animation variants
  const liveButtonVariants = {
    rest: { 
      scale: 1,
      backgroundColor: "rgb(239 246 255)",
      borderColor: "rgb(191 219 254)"
    },
    hover: { 
      scale: 1.05,
      backgroundColor: "rgb(219 234 254)",
      borderColor: "rgb(147 197 253)",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { 
      scale: 0.95, 
      transition: {
        duration: 0.1
      } 
    }
  };

  // Pulse animation for the live icon
  const pulseVariants = {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Waves animation variants for the radio wave effect
  const wavesVariants = {
    rest: { opacity: 0, scale: 0.8 },
    hover: {
      opacity: [0, 0.5, 0],
      scale: [0.8, 1.1, 1.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="rounded-2xl border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden relative w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="overflow-x-auto w-full px-2 md:px-3">
        <Table style={{ width: "100%" }}>
          <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-900">
            <TableRow className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/90 to-gray-50/50 dark:from-gray-800/90 dark:to-gray-800/50">
              <TableHead className="w-[320px] sm:w-[350px] md:w-[400px] font-semibold text-xs sm:text-sm text-blue-600 dark:text-blue-400 sticky left-0 bg-gray-50/90 dark:bg-gray-800/90 z-20">Teams</TableHead>
              <TableHead className="w-[150px] lg:w-[220px] font-semibold text-xs sm:text-sm text-blue-600 dark:text-blue-400">Competition</TableHead>
              <TableHead className="hidden sm:table-cell w-[130px] lg:w-[200px] font-semibold text-xs sm:text-sm text-blue-600 dark:text-blue-400">Start</TableHead>
              <TableHead className="hidden md:table-cell w-[110px] lg:w-[150px] font-semibold text-xs sm:text-sm text-blue-600 dark:text-blue-400">Round</TableHead>
              <TableHead className="hidden md:table-cell w-[120px] lg:w-[150px] font-semibold text-xs sm:text-sm text-blue-600 dark:text-blue-400">Venue</TableHead>
              <TableHead className="w-[100px] sm:w-[120px] lg:w-[180px] text-right font-semibold text-xs sm:text-sm text-blue-600 dark:text-blue-400 sticky right-0 bg-gray-50/90 dark:bg-gray-800/90 z-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixtures.map((fixture, index) => {
              // Get teams based on homeCompetitor reference
              const homeTeam = fixture.competitors.find(c => c.id === fixture.homeCompetitor.id);
              const awayTeam = fixture.competitors.find(c => c.id !== fixture.homeCompetitor.id);
              
              if (!homeTeam || !awayTeam) return null;
              
              // Extract team information
              const homeShortName = getMetadataValue(homeTeam, 'ShortName') || homeTeam.name;
              const awayShortName = getMetadataValue(awayTeam, 'ShortName') || awayTeam.name;
              
              return (
                <motion.tr
                  key={fixture.id}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-800"
                >
                  <TableCell className="font-medium sticky left-0 bg-white/80 dark:bg-gray-900/80 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 z-20">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 relative w-5 h-5 sm:w-6 sm:h-6 rounded-lg overflow-hidden">
                        <Image 
                          src="/favicon.ico" 
                          alt="Site logo" 
                          fill
                          sizes="(max-width: 640px) 20px, 24px"
                          className="object-contain"
                          priority
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white leading-tight">
                          {fixture.name}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {homeShortName || homeTeam.name} vs {awayShortName || awayTeam.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="p-1 sm:p-1.5 rounded-lg bg-amber-500/10">
                        <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                      </div>
                      <span className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300">
                        {fixture.competition.name}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" />
                      <time className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                        {new Date(fixture.startDate).toLocaleString('en-EN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </time>
                    </div>
                  </TableCell>
                  
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="p-0.5 sm:p-1 rounded-md bg-indigo-500/10">
                        <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                        {fixture.round?.name || 'Regular Season'}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="hidden md:table-cell">
                    {fixture.venue ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                          {fixture.venue.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">—</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="text-right p-1 sm:p-2 sticky right-0 bg-white/80 dark:bg-gray-900/80 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 z-20">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            className="inline-block"
                          >
                            <Link href={`/live/${fixture.id}`} className="inline-block">
                              <motion.div
                                variants={liveButtonVariants}
                                className="relative flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700 shadow-sm overflow-hidden"
                              >
                                {/* Background animated pulse effect */}
                                <motion.div 
                                  variants={wavesVariants}
                                  className="absolute inset-0 bg-blue-400 dark:bg-blue-500 rounded-full"
                                ></motion.div>
                                
                                {/* Foreground content */}
                                <div className="flex items-center gap-1 sm:gap-1.5 relative z-10">
                                  <motion.div variants={pulseVariants} className="relative">
                                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 dark:text-blue-400" />
                                    <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                                  </motion.div>
                                  <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-300">Live</span>
                                </div>
                              </motion.div>
                            </Link>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-blue-900 text-white border-blue-700">
                          <div className="flex items-center gap-1.5">
                            <Radio className="w-3 h-3 text-blue-300" />
                            <p>Watch live match updates</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* SVG illustrations for mockup purposes */}
      <div className="hidden">
        {/* Live view button mockup - used for documentation and reference */}
        <svg width="140" height="60" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="15" width="120" height="30" rx="15" fill="#EFF6FF" stroke="#BFDBFE" />
          <circle cx="25" cy="30" r="5" fill="#3B82F6" />
          <circle cx="25" cy="30" r="8" stroke="#93C5FD" strokeOpacity="0.5" strokeWidth="2" />
          <circle cx="25" cy="30" r="12" stroke="#93C5FD" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle cx="23" cy="27" r="1.5" fill="#FFFFFF" />
          <circle cx="27" cy="27" r="1" fill="#FF5252" />
          <path d="M60 27H100" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 33H85" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        </svg>
        
        {/* Live view hover state mockup */}
        <svg width="140" height="60" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="13" width="124" height="34" rx="17" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
          <circle cx="25" cy="30" r="6" fill="#2563EB" />
          <circle cx="25" cy="30" r="9" stroke="#60A5FA" strokeOpacity="0.7" strokeWidth="2" />
          <circle cx="25" cy="30" r="14" stroke="#60A5FA" strokeOpacity="0.4" strokeWidth="2" />
          <circle cx="23" cy="27" r="1.5" fill="#FFFFFF" />
          <circle cx="27" cy="27" r="1.5" fill="#FF5252" />
          <path d="M60 27H100" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M60 33H85" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

// Memoize the component for performance
export const FixturesTableV2 = memo(FixturesTableV2Component);