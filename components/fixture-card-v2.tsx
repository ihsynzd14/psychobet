import { memo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, MapPin, Radio, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { FixtureV2 } from '@/lib/api-v2';

interface FixtureCardV2Props {
  fixture: FixtureV2;
  className?: string;
}

// Extract team color from metadata or return fallback
function getTeamColor(competitor: any, isBackground = false): string {
  if (!competitor?.metadataProperties) return isBackground ? 'bg-gray-100' : 'text-gray-800';
  
  // Try to get color from metadata
  const colorKey = competitor.competitorType === 'Home' ? 'HomeShirtPrimary' : 'AwayShirtPrimary';
  const color = competitor.metadataProperties[colorKey];
  
  if (!color) return isBackground ? 'bg-gray-100' : 'text-gray-800';
  
  // Convert hex to tailwind-compatible class
  try {
    return isBackground ? `bg-[${color}]/10` : `text-[${color}]`;
  } catch {
    return isBackground ? 'bg-gray-100' : 'text-gray-800';
  }
}

// Memoized component for better performance
function FixtureCardV2Component({ fixture, className }: FixtureCardV2Props) {
  const homeTeam = fixture.competitors.find(c => c.competitorType === 'Home');
  const awayTeam = fixture.competitors.find(c => c.competitorType === 'Away');
  
  const startDate = new Date(fixture.startDate);
  const isLive = fixture.eventStatusType === 'InProgress';
  
  const getStatusBadge = () => {
    switch(fixture.eventStatusType) {
      case 'InProgress':
        return (
          <Badge variant="outline" className="px-2.5 py-1 bg-green-500/10 text-green-600 border-green-300/30 animate-pulse">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 inline-block"></span>
            Live
          </Badge>
        );
      case 'Notstarted':
        const now = new Date();
        const diffMs = startDate.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 30) {
          return (
            <Badge variant="outline" className="px-2.5 py-1 bg-yellow-500/10 text-yellow-600 border-yellow-300/30">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 inline-block"></span>
              Starting Soon
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="px-2.5 py-1 bg-blue-500/10 text-blue-600 border-blue-300/30">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </Badge>
        );
      case 'Finished':
        return (
          <Badge variant="outline" className="px-2.5 py-1 bg-gray-500/10 text-gray-600 border-gray-300/30">
            Finished
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="px-2.5 py-1 bg-gray-500/10 text-gray-600 border-gray-300/30">
            {fixture.eventStatusType}
          </Badge>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn("w-full", className)}
    >
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 h-full">
        <div className="p-4 sm:p-5">
          {/* Competition & Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-500/10">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                {fixture.competition.name}
              </span>
            </div>
            {getStatusBadge()}
          </div>
          
          {/* Teams */}
          <div className="space-y-3 mb-4">
            {/* Home Team */}
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", getTeamColor(homeTeam, true))}>
                <span className={cn("font-bold text-sm", getTeamColor(homeTeam))}>
                  {homeTeam?.name?.[0] || 'H'}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white truncate flex-1">
                {homeTeam?.name || 'Home Team'}
              </span>
            </div>
            
            {/* Away Team */}
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", getTeamColor(awayTeam, true))}>
                <span className={cn("font-bold text-sm", getTeamColor(awayTeam))}>
                  {awayTeam?.name?.[0] || 'A'}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white truncate flex-1">
                {awayTeam?.name || 'Away Team'}
              </span>
            </div>
          </div>
          
          {/* Match Info */}
          <div className="flex flex-col gap-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <time>
                {startDate.toLocaleString('en-EN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </time>
            </div>
            
            {fixture.venue && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate">{fixture.venue.name}</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all"
              asChild
            >
              <Link href={`/live/${fixture.id}`}>
                <Radio className="w-3 h-3 mr-1.5" />
                <span>Live View</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all"
              asChild
            >
              <Link href={`/match/${fixture.id}`}>
                <ExternalLink className="w-3 h-3 mr-1.5" />
                <span>Details</span>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Memoize the component for performance
export const FixtureCardV2 = memo(FixtureCardV2Component); 