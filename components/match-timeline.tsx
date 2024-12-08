'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { 
  AlertTriangle,
  Shield,
  MessageSquare
} from 'lucide-react';

interface TimelineEvent {
  type: string;
  id: number;
  timestamp: string;
  phase: string;
  timeElapsed: string;
  team?: string;
  isConfirmed: boolean;
  dangerState?: string;
  systemMessage?: string;
}

interface MatchTimelineProps {
  events: TimelineEvent[];
}

export function MatchTimeline({ events }: MatchTimelineProps) {
  const sortedEvents = useMemo(() => 
    [...events].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ), [events]
  );

  const getEventColor = (type: string, dangerState?: string) => {
    if (dangerState?.includes('Safe')) return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (dangerState?.includes('Dangerous')) return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    
    switch (type) {
      case 'Attack':
        return 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'Free Kick':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700';
    }
  };

  const getEventIcon = (type: string, dangerState?: string) => {
    if (dangerState?.includes('Safe')) return <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />;
    if (dangerState?.includes('Dangerous')) return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
    return <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
  };

  const TimelineEvent = ({ event }: { event: TimelineEvent }) => {
    const formattedTime = event.timestamp;
    const colorClass = getEventColor(event.type, event.dangerState);

    return (
      <div className="flex items-start gap-4 py-2 group">
        {/* Time column */}
        <div className="w-24 flex-shrink-0 text-sm text-muted-foreground">
          {formattedTime}
        </div>

        {/* Event content */}
        <div className={`flex-grow p-3 rounded-md border ${colorClass} transition-all duration-200`}>
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              {getEventIcon(event.type, event.dangerState)}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {event.timeElapsed} - {event.phase}
                </Badge>
                <span className="text-sm font-medium">
                  {event.dangerState || event.type}
                </span>
              </div>
              {event.systemMessage && (
                <p className="text-xs text-muted-foreground mt-1">
                  {event.systemMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="w-32 flex-shrink-0 text-sm text-right">
          {event.isConfirmed ? (
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20">
              Confirmed
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20">
              Pending
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Match Timeline</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20">
              Feed Reliable
            </Badge>
          </div>
        </div>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-1">
            {sortedEvents.map((event) => (
              <TimelineEvent key={`${event.type}-${event.id}`} event={event} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}