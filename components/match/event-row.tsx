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

    if (event.type === 'varStateChanges') {
      switch (event.varState) {
        case 'Danger':
          return 'bg-red-100 dark:bg-red-900/20';
        case 'InProgress':
          return 'bg-yellow-100 dark:bg-yellow-900/20';
        case 'Safe':
          return 'bg-green-100 dark:bg-green-900/20';
        default:
          return 'bg-gray-100 dark:bg-gray-900/20';
      }
    }

    return event.displaySide === 'left' 
      ? 'bg-primary/5' 
      : 'bg-secondary/5';
  };

  if (event.displaySide === 'center' && centerEventDetails) {
    return (
      <div className="flex items-center justify-center p-3">
        <div className="min-w-[90px] text-sm text-muted-foreground">
          {timestamp}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium">{centerEventDetails.title}</span>
          <Badge variant="outline" className="text-xs">
            {centerEventDetails.description}
          </Badge>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`
        flex items-center gap-4 p-3
        ${event.displaySide === 'right' ? 'flex-row-reverse' : 'flex-row'}
        ${getEventStyles(event)}
        transition-colors hover:bg-accent/5
      `}
    >
      <div className="min-w-[90px] text-sm text-muted-foreground">
        {timestamp}
      </div>

      <div className={`
        flex items-center gap-2
        ${event.displaySide === 'right' ? 'flex-row-reverse' : 'flex-row'}
      `}>
        <div className="flex-shrink-0">
          {getEventIcon(event.type, event.dangerState)}
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {formattedTime} - {event.phase}
            </Badge>
            {(event.team || event.foulingTeam) && (
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  event.category === 'disciplinary' ? 'bg-red-100 dark:bg-red-900/20' :
                  event.category === 'attack' ? 'bg-green-100 dark:bg-green-900/20' :
                  'bg-blue-100 dark:bg-blue-900/20'
                }`}
              >
                {event.team || event.foulingTeam}
              </Badge>
            )}
          </div>
          
          <span className="text-sm font-medium">
            {event.type === 'varStateChanges' 
              ? `VAR ${event.varReason} Check - ${event.varState}`
              : event.message || event.dangerState || event.type}
          </span>
        </div>
      </div>
    </div>
  );
});