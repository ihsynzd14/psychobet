import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { getEventIcon } from './event-icons';
import { formatTimestamp } from '@/lib/utils';
import { ProcessedMatchEvent } from './types/match-event';
import { formatMatchTime } from './utils';

interface EventRowProps {
  event: ProcessedMatchEvent;
  centerEventDetails?: {
    title: string;
    description: string;
  } | null;
}

export const EventRow = memo(function EventRow({ event, centerEventDetails }: EventRowProps) {
  const timestamp = new Date(event.timestamp).toLocaleTimeString();
  const formattedTime = formatMatchTime(event.timeElapsed, event.phase);
  
  const getEventStyles = (event: ProcessedMatchEvent) => {
    if (event.displaySide === 'center') {
      return 'text-center bg-transparent border-none';
    }

    // Event type based colors
    if (event.type === 'corners') {
      return 'bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800';
    }

    if (event.type === 'substitutions') {
      return 'bg-purple-100/80 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800';
    }

    if (event.type === 'shotsOffTarget') {
      return 'bg-slate-100/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800';
    }

    // Danger state based colors
    if (event.dangerState?.includes('DangerousAttack')) {
      return 'bg-red-200/90 dark:bg-red-950/50 border border-red-300 dark:border-red-900';
    }

    if (event.dangerState?.includes('Attack')) {
      return 'bg-amber-100/90 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800';
    }

    if (event.dangerState?.includes('Safe')) {
      return 'bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800';
    }

    // VAR states
    if (event.type === 'varStateChanges') {
      switch (event.varState) {
        case 'Danger':
          return 'bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800';
        case 'InProgress':
          return 'bg-yellow-100/80 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800';
        case 'Safe':
          return 'bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800';
        default:
          return 'bg-gray-100/80 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800';
      }
    }

    return 'bg-gray-100/80 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800';
  };

  if (event.displaySide === 'center' && centerEventDetails) {
    return (
      <div className="flex items-center justify-center p-2 my-1 max-w-md mx-auto">
        <div className="min-w-[50px] text-xs text-muted-foreground">
          {formattedTime}
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-medium">{centerEventDetails.title}</span>
          <span className="text-xs text-muted-foreground">{event.phase}</span>
        </div>
      </div>
    );
  }

  const TimelinePoint = () => (
    <div className="flex items-center gap-2">
      <div className="text-xs text-muted-foreground/70 min-w-[60px]">{timestamp}</div>
      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
      <div className="h-[1px] flex-grow bg-muted-foreground/20" />
    </div>
  );
  
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center max-w-[90%] mx-auto">
      {/* Left side */}
      <div className={event.displaySide === 'left' ? 'contents' : ''}>
        {event.displaySide === 'left' ? (
          <div 
            className={`
              p-3 my-2 rounded-lg shadow-sm w-full
              ${getEventStyles(event)}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 flex-grow">
                <div className="flex-shrink-0">
                  {getEventIcon(event.type, event.dangerState)}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-grow">
                  <span className="text-sm font-medium leading-tight truncate">
                    {event.type === 'varStateChanges' 
                      ? `VAR ${event.varReason} Check - ${event.varState}`
                      : event.message || event.dangerState || event.type}
                  </span>
                  {(event.team || event.foulingTeam) && (
                    <span className="text-xs text-muted-foreground/80">
                      {event.team || event.foulingTeam}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-sm font-medium">{formattedTime}</span>
                <span className="text-xs text-muted-foreground/80">{event.phase}</span>
              </div>
            </div>
          </div>
        ) : (
          <TimelinePoint />
        )}
      </div>

      {/* Center timeline dot */}
      <div className="w-3 h-3 rounded-full bg-muted-foreground/20 relative">
        <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
      </div>

      {/* Right side */}
      <div className={event.displaySide === 'right' ? 'contents' : ''}>
        {event.displaySide === 'right' ? (
          <div 
            className={`
              p-3 my-2 rounded-lg shadow-sm w-full
              ${getEventStyles(event)}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 flex-grow">
                <div className="flex-shrink-0">
                  {getEventIcon(event.type, event.dangerState)}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-grow">
                  <span className="text-sm font-medium leading-tight truncate">
                    {event.type === 'varStateChanges' 
                      ? `VAR ${event.varReason} Check - ${event.varState}`
                      : event.message || event.dangerState || event.type}
                  </span>
                  {(event.team || event.foulingTeam) && (
                    <span className="text-xs text-muted-foreground/80">
                      {event.team || event.foulingTeam}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-sm font-medium">{formattedTime}</span>
                <span className="text-xs text-muted-foreground/80">{event.phase}</span>
              </div>
            </div>
          </div>
        ) : (
          <TimelinePoint />
        )}
      </div>
    </div>
  );
});