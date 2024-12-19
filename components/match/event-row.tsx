import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { getEventIcon } from './event-icons';
import { formatTimestamp } from '@/lib/utils';
import { ProcessedMatchEvent } from './types/match-event';

interface EventRowProps {
  event: ProcessedMatchEvent;
  centerEventDetails?: {
    title: string;
    description: string;
  } | null;
}

export const EventRow = memo(function EventRow({ event, centerEventDetails }: EventRowProps) {
  const timestamp = formatTimestamp(event.timestamp);
  
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
              {event.timeElapsed} - {event.phase}
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
            {event.dangerState || event.type}
          </span>
          
          {event.message && (
            <p className="text-xs text-muted-foreground">
              {event.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});